import { GetStaticProps } from 'next';
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import Head from 'next/head';
import { useEffect, useState } from 'react';

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
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  function dateFormated(date: string) {
    return format(parseISO(date), 'd MMM yyyy', { locale: ptBR })
  }

  function loadMorePosts() {
    const morePosts = fetch(`${nextPage}`)
      .then(response => response.json())
      .then((data: PostPagination) => {
        setPosts([...posts, ...data.results])
        setNextPage(data.next_page)
      })
    
  }

  useEffect(() => {
    const postsFormated = posts.map((post) => {
      return {
        ...post,
        first_publication_date: dateFormated(post.first_publication_date)
      }
    })
    setPosts(postsFormated)
  }, [])

  return (
    <>
      <Head>
        <title>SpaceTraveling</title>
      </Head>
      <section>
        <div className={commonStyles.container}>
          <Link href="/">
            <a>
              <img src="/Logo.svg" alt="Logo" className={styles.logo}/>
            </a>
          </Link>
          {posts.map(({ data, first_publication_date, uid }) => (
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
          
          {nextPage && (
            <button 
              className={styles.morePosts}
              onClick={loadMorePosts}
            >Carregar mais posts</button>
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
    pageSize: 10
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.last_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results
  } 

  return {
    props: {
      postsPagination
    }
  }
};
