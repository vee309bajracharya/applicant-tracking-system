import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();
  return (
    <section className="main-style">
      <h1 className="text-2xl font-bold">Welcome{user ? `, ${user.fullname}` : ""}</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Welcome
      </p>
    </section>
  );
};

export default Home;
