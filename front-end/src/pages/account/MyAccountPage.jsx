import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Spinner from "../../components/ui/Spinner";
import FormError from "../../components/ui/FormError";
import AvatarUploader from "../../components/common/AvatarUploader";
import CustomLoader from "../../components/common/CustomLoader";
import { MyAccountValidationSchema, MyAccountInitialValues } from "../../validations/MyAccountValidationSchema";
import { useAuthMeQuery, useUpdateMeMutation } from "../../hooks/useAuthMe";

const MyAccountPage = () => {
  const { data: me, isLoading } = useAuthMeQuery();
  const updateMutation = useUpdateMeMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(MyAccountValidationSchema),
    defaultValues: MyAccountInitialValues,
  });

  useEffect(() => {
    if (me) {
      reset({
        fullname: me.fullname || "",
        email: me.email || "",
        phone: me.phone || "",
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    }
  }, [me, reset]);

  const onPhotoSelect = (file) => {
    updateMutation.mutate({ profile_photo: file });
  };

  const onSubmit = async (values) => {
    try {
      const payload = { fullname: values.fullname, email: values.email, phone: values.phone || "" };
      if (values.password) {
        payload.current_password = values.current_password;
        payload.password = values.password;
        payload.password_confirmation = values.password_confirmation;
      }
      await updateMutation.mutateAsync(payload);
      reset((prev) => ({ ...prev, current_password: "", password: "", password_confirmation: "" }));
    } catch (error) {
      console.error("Account update error:", error?.response?.data || error);
    }
  };

  if (isLoading) return <CustomLoader label="Loading your account..." />;

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">My account</h1>
      </header>

      <div className="flex flex-col md:flex-row gap-10">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1 max-w-xl order-2 md:order-1">
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">Account details form</legend>

            <div>
              <label htmlFor="fullname" className="text-sm font-medium">
                Full name *
              </label>
              <input id="fullname" type="text" autoComplete="name" className="inputbox mt-1" {...register("fullname")} />
              <FormError message={errors.fullname?.message} />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <input id="email" type="email" autoComplete="email" className="inputbox mt-1" {...register("email")} />
              <FormError message={errors.email?.message} />
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <input id="phone" type="tel" autoComplete="tel" className="inputbox mt-1" {...register("phone")} />
              <FormError message={errors.phone?.message} />
            </div>

            <div className="border-t border-gray-100 dark:border-dark-box-outline/50 pt-4 mt-2">
              <p className="text-sm font-semibold mb-3">Change password</p>
              <p className="text-xs text-gray-400 mb-3">Leave blank to keep your current password.</p>

              <div className="flex flex-col gap-3">
                <div>
                  <label htmlFor="current_password" className="text-sm font-medium">
                    Current password
                  </label>
                  <input
                    id="current_password"
                    type="password"
                    autoComplete="current-password"
                    className="inputbox mt-1"
                    {...register("current_password")}
                  />
                  <FormError message={errors.current_password?.message} />
                </div>
                <div>
                  <label htmlFor="password" className="text-sm font-medium">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className="inputbox mt-1"
                    {...register("password")}
                  />
                  <FormError message={errors.password?.message} />
                </div>
                <div>
                  <label htmlFor="password_confirmation" className="text-sm font-medium">
                    Confirm new password
                  </label>
                  <input
                    id="password_confirmation"
                    type="password"
                    autoComplete="new-password"
                    className="inputbox mt-1"
                    {...register("password_confirmation")}
                  />
                  <FormError message={errors.password_confirmation?.message} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="auth-btn w-auto px-6 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {updateMutation.isPending && <Spinner size={16} />}
              Save changes
            </button>
          </fieldset>
        </form>

        <div className="flex flex-col items-center gap-2 order-1 md:order-2">
          <AvatarUploader photoPath={me?.profile_photo} onSelect={onPhotoSelect} isUploading={updateMutation.isPending} />
          <p className="text-xs text-gray-400">JPG, PNG or WEBP, max 2MB</p>
        </div>
      </div>
    </section>
  );
};

export default MyAccountPage;
