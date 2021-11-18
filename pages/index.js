export default function Home() {
    return (
        <div className='layout space-y-3'>
            <h1 className='text-lg'>Ceramic data store</h1>
            <form className='space-y-4'>
                <div className='flex-col items-stretch space-y-1'>
                    <label htmlFor='title' className='block'>
                        Title
                    </label>
                    <input
                        placeholder='Enter a cool sounding title'
                        id='title'
                        className='w-full border px-3 py-2 border-gray-400 shadow-lg focus:outline-none focus:ring ring-offset-2 rounded-md transition-all'
                    />
                </div>
                <div className='flex-col items-stretch space-y-1'>
                    <label htmlFor='description' className='block'>
                        Description
                    </label>
                    <input
                        placeholder='Enter a cool sounding description'
                        id='description'
                        className='w-full border px-3 py-2 border-gray-400 shadow-lg focus:outline-none focus:ring ring-offset-2 rounded-md transition-all'
                    />
                </div>
            </form>
        </div>
    );
}
