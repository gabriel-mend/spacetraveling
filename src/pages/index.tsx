import { GetStaticProps } from 'next';
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <>
      <section>
        <div className={commonStyles.container}>
          <img src="/Logo.svg" alt="Logo" className={styles.logo}/>
          {postsPagination.results.map(({ data, first_publication_date, uid }) => (
            <article className={styles.post} key={uid}>
              <Link href={`/post/${uid}`}>
                <a>
                  <h1>{data.title}</h1>
                  <p>{data.subtitle}</p>
                  <div className={commonStyles.postInfos}>
                    <div>
                      <img src="/calendar.svg" alt={`Data do post - ${first_publication_date}`} />
                      <span>{first_publication_date}</span>
                    </div>
                    <div>
                      <img src="/user.svg" alt={`Autor do post - ${data.author}`} />
                      <span>{data.author}</span>
                    </div>
                  </div>
                </a>
              </Link>
            </article>
          ))}
          
          {postsPagination.next_page && (
            <button>Carregar mais posts</button>
          )}
        </div>
      </section>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    pageSize: 20
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(parseISO(post.last_publication_date), 'd MMM yyyy', { locale: ptBR }),
      data: post.data
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      } 
    }
  }
};
