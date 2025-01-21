import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
import ThemeToggle from './ThemeToggle'



interface HeaderProps {
  className?: string
}
const Header = (className: HeaderProps) => {
  return (
    <header className={cn("fixed top-0 w-full z-50 border-b g-background backdrop-blur supports-[backdrop-filter]:bg-background/60",className)}>
         <div className='container flex items-center justify-between h-16 mx-auto'>
              <Link href='/'>Projex</Link>
         </div>
         <div className='border-l pl-4 dark:border-gray-800'>
            <ThemeToggle/>
         </div>
    </header>
  )
}

export default Header
