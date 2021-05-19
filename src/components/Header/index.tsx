import Link from 'next/link'
import styles from './header.module.scss'

export default function Header() {
  return (
    <section className={styles.header}>
      <div>
        <Link href="/">
          <a>
            <img src="/Logo.svg" alt="logo"/>
          </a>
        </Link>
      </div>
    </section>
  )
}
