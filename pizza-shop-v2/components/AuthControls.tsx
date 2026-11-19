"use client";

import { SignedIn, SignedOut, SignInButton, SignOutButton, User } from "@asgardeo/nextjs";

type Profile = Record<string, string | undefined>;

function ProfileMenu({ user }: { user: Profile }) {
  const firstName = user.given_name || user.givenName;
  const lastName = user.family_name || user.familyName;
  const email = user.email;
  const phone = user.phone_number || user.phoneNumber;
  const username = user.preferred_username || user.username || user.userName;
  const label = username || [firstName, lastName].filter(Boolean).join(" ") || email || "Profile";
  const initial = (firstName || lastName || label).charAt(0).toUpperCase();

  return (
    <details className="profile-menu">
      <summary className="profile-trigger">
        <span className="profile-avatar" aria-hidden="true">{initial}</span>
        <span className="profile-trigger-label">{label}</span>
        <span className="profile-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="profile-card">
        <p className="profile-card-title">Your profile</p>
        <dl className="profile-details">
          <div><dt>First name</dt><dd>{firstName || "Not available"}</dd></div>
          <div><dt>Last name</dt><dd>{lastName || "Not available"}</dd></div>
          <div><dt>Email</dt><dd>{email || "Not available"}</dd></div>
          {phone && <div><dt>Phone</dt><dd>{phone}</dd></div>}
        </dl>
        <SignOutButton className="profile-signout">Log out</SignOutButton>
      </div>
    </details>
  );
}

export function AuthControls() {
  return (
    <div className="auth-controls">
      <SignedOut>
        <SignInButton className="auth-button">Log in</SignInButton>
      </SignedOut>
      <SignedIn>
        <User>
          {(user) =>
            user && <ProfileMenu user={user as Profile} />
          }
        </User>
      </SignedIn>
    </div>
  );
}
