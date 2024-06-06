import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";

export default function Edit({ auth, mustVerifyEmail, status, roles }) {
    return (
        <DashboardLayout user={auth.user} roles={roles} title="Editar Perfil">
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Editar Perfil",
                        link: route("profile.edit"),
                    },
                ]}
            />

            <div className="mx-auto sm:px-6 lg:px-8">
                <div className="p-4 sm:p-8 bg-white">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="p-4 sm:p-8 bg-white">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>
            </div>
        </DashboardLayout>
    );
}
