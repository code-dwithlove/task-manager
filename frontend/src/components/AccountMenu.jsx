
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getMyProfile,
    deleteMyAccount
} from "../api/accountApi";
import "../css/AccountMenu.css";

function AccountMenu() {
    const [profile, setProfile] = useState(null);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await getMyProfile();
                setProfile(res.data);
            } catch (err) {
                console.error("Could not load profile:", err);
            }
        }

        loadProfile();
    }, []);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        navigate("/login", { replace: true });
    }

    async function handleDeleteAccount() {
        const confirmation = window.prompt(
            'This action is permanent. Type DELETE to confirm:'
        );

        if (confirmation !== "DELETE") {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await deleteMyAccount();

            localStorage.removeItem("token");
            localStorage.removeItem("email");

            navigate("/login", { replace: true });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not delete your account. Please try again."
            );
            setDeleting(false);
        }
    }

    const name = profile?.name || "My Account";
    const email = profile?.email || localStorage.getItem("email") || "";
    const initial = name.charAt(0).toUpperCase();

    return (
        <div
            className="account-menu"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                className="account-trigger"
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
                aria-label="Open account menu"
            >
                <span className="account-avatar">
                    {initial}
                </span>
                <span className="account-trigger-name">
                    {name}
                </span>
                <span className="account-chevron"></span>
            </button>

            {open && (
                <div className="account-dropdown">

                    <div className="account-profile">
                        <div className="account-avatar account-avatar-large">
                            {initial}
                        </div>

                        <div className="account-profile-info">
                            <strong>{name}</strong>
                            <span>{email}</span>
                        </div>
                    </div>

                    <div className="account-divider" />

                    {profile?.createdAt && (
                        <div className="account-meta">
                            <span>Member since</span>
                            <strong>
                                {new Date(profile.createdAt).toLocaleDateString()}
                            </strong>
                        </div>
                    )}

                    {error && (
                        <p className="account-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="button"
                        className="account-action logout-action"
                        onClick={logout}
                    >
                        <span>↪</span>
                        Log out
                    </button>

                    <button
                        type="button"
                        className="account-action delete-action"
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                    >
                        <span>⌫</span>
                        {deleting ? "Deleting account..." : "Delete account"}
                    </button>

                </div>
            )}
        </div>
    );
}

export default AccountMenu;
