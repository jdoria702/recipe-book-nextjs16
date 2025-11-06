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
                <Link href='/add-recipe' className='flex items-center gap-2'>
                  <Image src="/icons/add.png" alt="add-recipe" width={24} height={24} />
                </Link>
            </ul>
        </nav>
    </header>
  )
}

export default Navbar