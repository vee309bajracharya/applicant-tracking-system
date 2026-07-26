import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import CustomLoader from "../components/common/CustomLoader";
import { useCurrentUserQuery } from "../hooks/useCurrentUserQuery";

const MainLayout = () => {
  const { isLoading } = useCurrentUserQuery();

  if (isLoading) return <CustomLoader label="Loading your profile..." />;

  return (
    <section className="min-h-screen dark:bg-dark-overlay dark:text-white main-style">
      <Navbar />
      <main className="wrapper">
        <Outlet />
      </main>
    </section>
  );
};

export default MainLayout;
