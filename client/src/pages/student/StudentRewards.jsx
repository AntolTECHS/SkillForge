const StudentRewards = () => {
  const rewards = [
    { id: 1, title: "Level 1 Achiever", xp: 1000, badgeColor: "bg-yellow-400" },
    { id: 2, title: "Level 2 Scholar", xp: 2000, badgeColor: "bg-green-400" },
    { id: 3, title: "Level 3 Champion", xp: 3000, badgeColor: "bg-purple-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🏅 XP & Rewards</h1>
      <p className="text-gray-600 mb-6">
        Earn XP by completing courses and unlock new badges!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white p-6 rounded-2xl shadow border border-gray-200 text-center"
          >
            <div
              className={`mx-auto w-16 h-16 rounded-full ${reward.badgeColor} flex items-center justify-center text-2xl font-bold text-white mb-3`}
            >
              {reward.id}
            </div>
            <h2 className="text-xl font-semibold">{reward.title}</h2>
            <p className="text-gray-600">XP Required: {reward.xp}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentRewards;
