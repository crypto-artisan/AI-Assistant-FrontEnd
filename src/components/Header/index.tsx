import { Link } from 'react-router-dom';
// import DropdownMessage from './DropdownMessage';
// import DropdownNotification from './DropdownNotification';
// import DropdownUser from './DropdownUser';
// import LogoIcon from '../../images/logo/logo-icon.svg';
// import LogoIcon from '../../../public/open-ai.svg';
import LogoIcon from '../../../public/logo.png';
// import LogoIcon from '../../../public/logo.png';
import DarkModeSwitcher from './DarkModeSwitcher';

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-[#081d3d] dark:bg-[#61c6ea] dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link className="block flex-shrink-0" to="/">
            <a href="https://systemhub.com" target="_blank" rel="noopener noreferrer">
              <img src={LogoIcon} alt="Logo" className='h-10 w-auto' />
            </a>
          </Link>
        </div>
        <div className="hidden sm:block">
        </div>
        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* <!-- Dark Mode Toggler --> */}
            {/* <DarkModeSwitcher /> */}
            {/* <!-- Dark Mode Toggler --> */}

            {/* <!-- Notification Menu Area --> */}
            {/* <DropdownNotification /> */}
            {/* <!-- Notification Menu Area --> */}

            {/* <!-- Chat Notification Area --> */}
            {/* <DropdownMessage /> */}
            {/* <!-- Chat Notification Area --> */}
          </ul>

          {/* <!-- User Area --> */}
          {/* <DropdownUser /> */}
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
