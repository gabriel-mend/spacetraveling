import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client'

import { getPrismicClient } from '../../services/prismic';
import { RichText } from "prismic-dom"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

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
  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  function dateFormated(date: string) {
    return format(parseISO(date), 'd MMM yyyy', { locale: ptBR })
  }

  function calculateEstimatedReadingTime(post: Post): number {
    const wordsPerMinute = 200;
    const wordsCount =
      RichText.asText(
        post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
      ).split(' ').length +
      RichText.asText(
        post.data.content.reduce((acc, data) => {
          if (data.heading) {
            return [...acc, ...data.heading.split(' ')];
          }
          return [...acc];
        }, [])
      ).split(' ').length;
  
    const readingEstimatedTime = Math.ceil(wordsCount / wordsPerMinute);
    return readingEstimatedTime;
  }
  
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
            <img src="/calendar.svg" alt={`Data do post - ${dateFormated(post.first_publication_date)}`} />
            <span>{dateFormated(post.first_publication_date)}</span>
          </div>
          <div>
            <img src="/user.svg" alt={`Autor do post - ${post.data.author}`} />
            <span>{post.data.author}</span>
          </div>
          <div>
            <img src="/clock.svg" alt={`Tempo de leitura do post - `} />
            <span>{calculateEstimatedReadingTime(post)} min</span>
          </div>
        </div>
        <div className={styles.content}>
          {post.data.content.map(({ heading, body }) => (
            <div key={heading}>
              <h1>{heading}</h1>
              {body.map(({ text }) => (
                <div key={text} dangerouslySetInnerHTML={{ __html: text }}></div>
              ))}
            </div>
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

  const post = await prismic.getByUID('posts', String(slug), {})

  return {
    props: {
      post
    }
  }
};
