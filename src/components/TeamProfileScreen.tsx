import React, { useState } from 'react';
import { StudentProposal, StudentProfile } from '../types';
import { CURRENT_STUDENT_PROFILE } from '../data/mockData';
import { calculateTeamProgress } from '../utils/teamProgress';
import { 
  GraduationCap, 
  Edit3, 
  TrendingUp,
  Award,
  Users,
  Mail,
  Send,
  Github,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { XPProgressBar } from './ui/XPProgressBar';

interface TeamProfileScreenProps {
  proposals?: StudentProposal[];
  onNavigateToProgress?: () => void;
}

export const TeamProfileScreen: React.FC<TeamProfileScreenProps> = ({
  proposals = [],
  onNavigateToProgress,
}) => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<StudentProfile>(CURRENT_STUDENT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [skillsInput, setSkillsInput] = useState(profile.skills.join(', '));

  const teamProgress = calculateTeamProgress(proposals);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSkills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    setProfile({ ...profile, skills: updatedSkills });
    setIsEditing(false);
    showToast('Профиль команды успешно обновлен!', 'success');
  };

  const latestAchievement = teamProgress.achievements.find(a => a.isUnlocked) || teamProgress.achievements[0];

  const teamMembers = [
    { name: profile.captain, role: 'Капитан / CV & ML Lead' },
    { name: 'Аружан Даниярова', role: 'Backend / FastAPI & Docker' },
    { name: 'Тимур Рахимов', role: 'Data Engineer / ETL & PyTorch' },
    { name: 'Дидар Омаров', role: 'Frontend / Streamlit & React' },
  ];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
      {/* 1. Header with single H1 and 1-line subtitle (Requirement 2 & 17) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#667085]">
            <GraduationCap className="w-3.5 h-3.5 text-[#2CC7B5]" />
            <span>Кабинет студенческой команды</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17171C] tracking-tight">
            Профиль студенческой команды
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] max-w-xl">
            Компетенции, подтверждённый стек технологий и достижения команды перед заказчиками.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="h-10 px-4 bg-white border border-[#E2E5EE] hover:bg-[#F4F5F9] text-xs font-bold text-[#17171C] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#7047EB]" />
          <span>{isEditing ? 'Отмена' : 'Редактировать профиль'}</span>
        </button>
      </div>

      {/* 2. 12-Column Grid Layout (7 cols info / 5 cols progress) per Requirement 12 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Main Team Information (Requirement 12) */}
        <div className="lg:col-span-7 space-y-5">
          {isEditing ? (
            <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17171C]">
                    Название команды
                  </label>
                  <input
                    type="text"
                    value={profile.teamName}
                    onChange={(e) => setProfile({ ...profile, teamName: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-bold text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17171C]">
                    Вуз / Город
                  </label>
                  <input
                    type="text"
                    value={profile.university}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-bold text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17171C]">
                    Капитан команды
                  </label>
                  <input
                    type="text"
                    value={profile.captain}
                    onChange={(e) => setProfile({ ...profile, captain: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-bold text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17171C]">
                    Технологии (через запятую)
                  </label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs font-bold text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#17171C]">
                  О команде
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#E2E5EE] bg-[#F8F9FC] text-xs text-[#17171C] focus:bg-white focus:outline-none focus:border-[#7047EB]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="h-10 px-5 bg-[#7047EB] text-white text-xs font-bold rounded-xl hover:bg-[#5E32DF] transition-all cursor-pointer shadow-xs"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Main Card: Name, University, Bio */}
              <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-[#F0F2F7]">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2CC7B5] to-[#7047EB] text-white flex items-center justify-center font-black text-xl shadow-xs">
                    {profile.teamName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-black text-[#17171C] truncate">
                      {profile.teamName}
                    </h2>
                    <div className="text-xs text-[#667085] flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-[#17171C]">{profile.university}</span>
                      <span>•</span>
                      <span>{profile.membersCount} участников</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                    О команде
                  </div>
                  <p className="text-xs text-[#475467] leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              </div>

              {/* Technologies (Requirement 12) */}
              <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Технологии и стек команды
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-[#F8F9FD] border border-[#E2E5EE] text-xs font-bold text-[#17171C]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Members / Participants (Requirement 12) */}
              <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Участники команды ({teamMembers.length})
                  </h3>
                  <span className="text-[11px] text-[#667085] font-semibold">Капитан: {profile.captain}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teamMembers.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE] flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#EAECEF] text-[#667085] flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#17171C] truncate">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-[#667085] truncate">
                          {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contacts (Requirement 12) */}
              <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Контакты для связи
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE] space-y-0.5">
                    <span className="text-[10px] text-[#667085] font-semibold block">Telegram</span>
                    <span className="font-bold text-[#7047EB]">{profile.telegram}</span>
                  </div>
                  <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE] space-y-0.5">
                    <span className="text-[10px] text-[#667085] font-semibold block">Email</span>
                    <span className="font-bold text-[#17171C] truncate block">{profile.email}</span>
                  </div>
                  <div className="p-3 bg-[#F8F9FC] rounded-xl border border-[#E2E5EE] space-y-0.5">
                    <span className="text-[10px] text-[#667085] font-semibold block">GitHub</span>
                    <span className="font-bold text-[#17171C] truncate block">{profile.githubOrg}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Compact Progress Column (Requirement 12) */}
        <div className="lg:col-span-5 space-y-5 sticky top-6">
          <div className="bg-white rounded-2xl border border-[#E2E5EE] p-6 shadow-xs space-y-5">
            {/* Level & XP */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F2F7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0ECFF] text-[#7047EB] flex items-center justify-center font-black">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#667085]">Уровень команды</div>
                  <div className="text-sm font-black text-[#17171C]">
                    {teamProgress.levelInfo.name} · Уровень {teamProgress.levelInfo.level}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-[#7047EB] tabular-nums">
                  {teamProgress.totalXP} XP
                </span>
              </div>
            </div>

            {/* Smooth Animated Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-[#667085]">
                  {teamProgress.xpRemaining > 0 
                    ? `До «${teamProgress.nextLevelName}»: ${teamProgress.xpRemaining} XP` 
                    : 'Высший уровень'}
                </span>
                <span className="text-[#7047EB] tabular-nums">{teamProgress.progressPercent}%</span>
              </div>
              <XPProgressBar
                value={teamProgress.progressPercent}
                heightClass="h-2.5"
                showGlow={true}
                showShimmer={true}
              />
            </div>

            {/* Confirmed Milestones & Projects Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#F8F9FD] rounded-xl border border-[#E2E5EE] space-y-1">
                <div className="text-[11px] text-[#667085] font-medium">Подтверждено этапов</div>
                <div className="text-xl font-black text-[#149A8B] tabular-nums">
                  {teamProgress.confirmedMilestonesCount}
                </div>
              </div>
              <div className="p-3.5 bg-[#F8F9FD] rounded-xl border border-[#E2E5EE] space-y-1">
                <div className="text-[11px] text-[#667085] font-medium">Завершено проектов</div>
                <div className="text-xl font-black text-[#7047EB] tabular-nums">
                  {teamProgress.completedProjectsCount}
                </div>
              </div>
            </div>

            {/* Latest Achievement */}
            {latestAchievement && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#F0ECFF] to-[#FAF8FF] border border-[#7047EB]/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#7047EB]" />
                  <span className="text-[11px] font-bold text-[#7047EB] uppercase tracking-wider">
                    {latestAchievement.isUnlocked ? 'Последнее достижение' : 'Следующее достижение'}
                  </span>
                </div>
                <div className="text-xs font-black text-[#17171C]">
                  {latestAchievement.title}
                </div>
                <div className="text-[11px] text-[#667085]">
                  {latestAchievement.description}
                </div>
              </div>
            )}

            {/* Action button: История прогресса */}
            {onNavigateToProgress && (
              <button
                type="button"
                onClick={onNavigateToProgress}
                className="w-full h-11 bg-[#F4F5F9] hover:bg-[#EAECEF] text-[#17171C] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#E2E5EE]"
              >
                <span>История прогресса и XP</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#667085]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
