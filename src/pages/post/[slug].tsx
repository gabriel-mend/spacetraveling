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

export default function Post() {
  return (
    <>
      <Header />
    </>
  )
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query();

// };

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params

  const prismic = getPrismicClient()

  const { data } = await prismic.getByUID('posts', String(slug), {})

  const post = {
    title: data.title,
    content: data.content,
    // author: data.author,
    // banner: data.banner,
    // subtitle: data.subtitle,
  }
  
  return {
    props: {
      post
    }
  }
};
