import React, { useState, ReactNode } from 'react';
import Header from '../components/Header/index';

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-[#fff] dark:text-bodydark dark:bg-[#081d3d]">
      <div className="flex h-screen overflow-hidden">
        {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <h1 className='self-center sm:text-[40px] mt-5 mb-10 text-[0px] dark:text-white text-[#61c6ea] font-extrabold'>Easy to Use — No Tech Skills Required</h1> */}
          {/* <img src="./src/images/wave-top.svg" height={"10px"} className='w-full' /> */}
          {/* <img src = "back-top.png" height={"10px"} className='w-[32%] sm:h-8 h-[0px] self-center mb-3' /> */}
          {/* <h1 className='text-center text-[32px]'>

            hi I'm Roman.
            My Upwork account is blocked.
            Contact me by gmail.<br/>
            rkulkin47@gmail.com

          </h1> */}
          <main className='h-screen'>
            <div className="mx-auto max-w-screen-2xl justify-items-stretch h-full relative my-5">
              {children}
            </div>
          </main>
          {/* <img src="wave-bottom.svg" height={"10px"} className='sm:w-full w-0 absolute bottom-0' /> */}
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
