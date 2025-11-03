import Link from 'next/link'
import Image from 'next/image';
import React from 'react'

const Navbar = () => {
  return (
    <header>
        <nav>
            <Link href='/' className="logo">
                <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
                <p>CookBook</p>
            </Link>

            <ul>
                <Link href='/'>Add Your Recipe</Link>
            </ul>
        </nav>
    </header>
  )
}

export default Navbar