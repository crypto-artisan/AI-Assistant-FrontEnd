import React, { useState, ReactNode } from 'react';
import Header from '../components/Header/index';

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dark:bg-[#070711] dark:text-bodydark bg-[#081d3d]">
      <div className="flex h-screen overflow-hidden">
        {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <h1 className='self-center sm:text-[40px] mb-10 text-[0px] text-white font-extrabold'>Easy to Use — No Tech Skills Required</h1>
          {/* <img src="./src/images/wave-top.svg" height={"10px"} className='w-full' /> */}
          <img src = "back-top.png" height={"10px"} className='w-[32%] sm:h-8 h-[0px] self-center mb-3' />
          <main>
            <div className="mx-auto max-w-screen-2xl justify-items-stretch h-full relative">
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
