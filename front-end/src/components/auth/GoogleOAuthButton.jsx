import { toast } from "sonner";
import GoogleIcon from "../../assets/svg/google.svg";

const GoogleOAuthButton = ({text="Continue with Google"}) => {

  const oauthUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/oauth/google/redirect`;

  return (
    <section className="main-style">
      <a
        href={oauthUrl}
        className="w-full border border-box-outline rounded-md py-2 flex items-center justify-center gap-2 text-md font-medium hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors duration-200 cursor-pointer"
        aria-label={text}
      >
        <img src={GoogleIcon} alt="Google Icon" className="w-4" /> {text}
      </a>
    </section>

  );
};

export default GoogleOAuthButton;
