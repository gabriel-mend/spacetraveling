import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client'

import { getPrismicClient } from '../../services/prismic';
import { RichText } from "prismic-dom"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Header />
      <div className={styles.bannerContainer}>
        {post.data?.banner?.url && (
          <img src={post.data.banner.url} alt=""/>
        )}
      </div>
      <main className={commonStyles.container}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <div className={commonStyles.postInfos}>
          <div>
            <img src="/calendar.svg" alt={`Data do post - ${post.first_publication_date}`} />
            <span>{post.first_publication_date}</span>
          </div>
          <div>
            <img src="/user.svg" alt={`Autor do post - ${post.data.author}`} />
            <span>{post.data.author}</span>
          </div>
        </div>
        <div>
          {post.data.content.map(({ heading, body }) => (
            <>
              <h1>{heading}</h1>
              {body.map(({ text }) => (
                <div dangerouslySetInnerHTML={{ __html: text }}></div>
              ))}
            </>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ]);

  const paths = posts.results.map(post => {
    return { params: { slug: post.uid }}
  })

  return {
    paths,
    fallback: 'blocking'
  }

};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params

  const prismic = getPrismicClient()

  const { data, first_publication_date } = await prismic.getByUID('posts', String(slug), {})


  const timeToRead = data.content.reduce((acc, next) => {
    console.log(acc)
  }) 

  const body = data.content?.body?.map(({ text }) => {
    return RichText.asHtml(text)
  })

  console.log(body)

  const post = {
    data: {
      title: data.title,
      content: data.content,
      author: data.author,
      banner: data.banner,
      subtitle: data.subtitle,
    },
    first_publication_date: format(parseISO(first_publication_date), 'd MMM yyyy', { locale: ptBR }),
  }
  return {
    props: {
      post
    }
  }
};
