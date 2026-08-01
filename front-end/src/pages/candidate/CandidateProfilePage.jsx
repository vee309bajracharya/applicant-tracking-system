import { useCandidateProfileQuery } from "../../hooks/useCandidateProfile";
import { useAuthMeQuery, useUpdateMeMutation } from "../../hooks/useAuthMe";
import CustomLoader from "../../components/common/CustomLoader";
import AvatarUploader from "../../components/common/AvatarUploader";
import ProfileCompletionCard from "../../components/candidate/ProfileCompletionCard";
import ProfileFormCard from "../../components/candidate/ProfileFormCard";
import ResumeList from "../../components/candidate/ResumeList";
import SkillsManager from "../../components/candidate/SkillsManager";

const CandidateProfilePage = () => {
  const { data: profile, isLoading, isError } = useCandidateProfileQuery();
  const { data: me } = useAuthMeQuery();
  const updateMeMutation = useUpdateMeMutation();

  if (isLoading) return <CustomLoader label="Loading your profile..." />;

  const resolvedProfile = isError ? null : profile;

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">My profile</h1>
      </header>

      {resolvedProfile && <ProfileCompletionCard percentage={resolvedProfile.profile_completion_percentage} />}

      <div className="flex flex-col md:flex-row gap-10 mb-10">
        <div className="flex-1 order-2 md:order-1">
          <ProfileFormCard profile={resolvedProfile} />
        </div>
        
        <div className="flex flex-col items-center gap-2 order-1 md:order-2">
          <AvatarUploader
            photoPath={me?.profile_photo}
            onSelect={(file) => updateMeMutation.mutate({ profile_photo: file })}
            isUploading={updateMeMutation.isPending}
          />
          <p className="text-xs text-gray-400">JPG, PNG or WEBP, max 2MB</p>
        </div>
      </div>

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
