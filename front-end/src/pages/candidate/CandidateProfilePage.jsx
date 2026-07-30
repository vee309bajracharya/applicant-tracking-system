import { useCandidateProfileQuery } from "../../hooks/useCandidateProfile";
import CustomLoader from "../../components/common/CustomLoader";
import ProfileCompletionCard from "../../components/candidate/ProfileCompletionCard";
import ProfileFormCard from "../../components/candidate/ProfileFormCard";
import ResumeList from "../../components/candidate/ResumeList";
import SkillsManager from "../../components/candidate/SkillsManager";

const CandidateProfilePage = () => {
  const { data: profile, isLoading, isError } = useCandidateProfileQuery();

  if (isLoading) return <CustomLoader label="Loading your profile..." />;

  const resolvedProfile = isError ? null : profile;

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">My profile</h1>
      </header>

      {resolvedProfile && <ProfileCompletionCard percentage={resolvedProfile.profile_completion_percentage} />}

      <ProfileFormCard profile={resolvedProfile} />

      {resolvedProfile && (
        <>
          <ResumeList />
          <SkillsManager />
        </>
      )}
      {!resolvedProfile && (
        <p className="text-sm text-gray-400">Save your profile first to unlock resume uploads and skills.</p>
      )}
    </section>
  );
};

export default CandidateProfilePage;
