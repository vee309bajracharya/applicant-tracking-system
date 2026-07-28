import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import SideNav from "../components/layout/SideNav";
import MobileBottomNav from "../components/layout/MobileBottomNav";
import CustomLoader from "../components/common/CustomLoader";
import { useCurrentUserQuery } from "../hooks/useCurrentUserQuery";

const MainLayout = () => {
  const { isLoading } = useCurrentUserQuery();

  if (isLoading) return <CustomLoader label="Loading" />;

  return (
    <section className="min-h-screen dark:bg-dark-overlay dark:text-white main-style">
      <Navbar />
      <div className="flex">
        <SideNav />
        <main className="wrapper flex-1 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </section>
  );
};

export default MainLayout;
