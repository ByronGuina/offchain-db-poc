import Link from 'next/link';

export default function Home() {
    return (
        <nav className='layout'>
            <ul className='space-y-6'>
                <li>
                    <Link href='/ceramic'>
                        <a className='underline'>Ceramic POC</a>
                    </Link>
                </li>
                <li>
                    <Link href='/threaddb'>
                        <a className='underline'>ThreadDB POC</a>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
