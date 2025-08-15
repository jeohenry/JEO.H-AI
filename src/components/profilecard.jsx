import React from "react";

const ProfileCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-white shadow rounded mb-4">
      <img
        src={user.profile_picture || "/default-avatar.png"}
        alt="Profile"
        className="w-20 h-20 rounded-full object-cover border"
      />
      <div>
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-gray-600">@{user.username}</p>
        <p className="text-sm italic text-gray-500">Status: {user.relationship_status || "Not set"}</p>
        {user.is_private && (
          <span className="inline-block mt-1 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
            🔒 Private Profile
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;