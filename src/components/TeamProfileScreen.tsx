import React, { useState } from 'react';
import { CURRENT_STUDENT_PROFILE } from '../data/mockData';
import { 
  UserCheck, 
  GraduationCap, 
  Users, 
  Code, 
  ExternalLink, 
  Mail, 
  Send, 
  Edit3, 
  Check, 
  Sparkles
} from 'lucide-react';

export const TeamProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState(CURRENT_STUDENT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#17171C] tracking-tight">
            Профиль студенческой команды
          </h2>
          <p className="text-sm text-[#667085] mt-1">
            Информация о команде, ключевые компетенции и контактные данные для связи с бизнесом
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="h-10 px-4 bg-white border border-[#E5E7EF] hover:bg-[#F5F6FA] text-xs font-bold text-[#17171C] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#667085]" />
          <span>{isEditing ? 'Отмена' : 'Редактировать профиль'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#36B875]/15 border border-[#36B875]/30 rounded-2xl text-xs font-bold text-[#258B55] flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Профиль команды успешно обновлен!</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#E5E7EF] p-6 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17171C] uppercase tracking-wider mb-1.5">
                Название команды
              </label>
              <input
                type="text"
                value={profile.teamName}
                onChange={(e) => setProfile({ ...profile, teamName: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17171C] uppercase tracking-wider mb-1.5">
                Вуз / Организация
              </label>
              <input
                type="text"
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17171C] uppercase tracking-wider mb-1.5">
                Капитан команды
              </label>
              <input
                type="text"
                value={profile.captain}
                onChange={(e) => setProfile({ ...profile, captain: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17171C] uppercase tracking-wider mb-1.5">
                Telegram капитана
              </label>
              <input
                type="text"
                value={profile.telegram}
                onChange={(e) => setProfile({ ...profile, telegram: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17171C] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-semibold text-[#17171C] focus:outline-none focus:border-[#7047EB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17171C] uppercase tracking-wider mb-1.5">
              О себе и специализация
            </label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full p-3.5 rounded-xl bg-[#F5F6FA] border border-[#E5E7EF] text-sm font-medium text-[#17171C] focus:outline-none focus:border-[#7047EB]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="h-11 px-6 bg-[#7047EB] hover:bg-[#5b32d6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Сохранить изменения
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E7EF] p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EF]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#36B875]/15 text-[#36B875] flex items-center justify-center font-extrabold text-xl shrink-0">
                VC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-[#17171C]">
                    {profile.teamName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#36B875]/10 text-[#258B55]">
                    Верифицирована
                  </span>
                </div>
                <div className="text-sm text-[#667085] flex items-center gap-1.5 mt-0.5">
                  <GraduationCap className="w-4 h-4 text-[#667085]" />
                  <span>{profile.university}</span>
                </div>
              </div>
            </div>

            <a
              href={profile.githubOrg}
              target="_blank"
              rel="noreferrer"
              className="h-10 px-4 bg-[#F5F6FA] hover:bg-[#E5E7EF] text-[#17171C] text-xs font-bold rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto border border-[#E5E7EF]"
            >
              <ExternalLink className="w-4 h-4 text-[#667085]" />
              <span>GitHub организации</span>
            </a>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
              Специализация и опыт команды
            </span>
            <p className="text-sm text-[#17171C] leading-relaxed bg-[#F5F6FA] p-4 rounded-xl border border-[#E5E7EF]">
              {profile.bio}
            </p>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
              Стек технологий и компетенции
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F0ECFF] text-[#7047EB]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E5E7EF] text-xs">
            <div className="p-3.5 bg-[#F5F6FA] rounded-xl border border-[#E5E7EF]">
              <span className="text-[#667085] block mb-1">Капитан команды:</span>
              <strong className="text-[#17171C] text-sm block">{profile.captain}</strong>
            </div>

            <div className="p-3.5 bg-[#F5F6FA] rounded-xl border border-[#E5E7EF]">
              <span className="text-[#667085] block mb-1">Telegram для связи:</span>
              <a
                href={`https://t.me/${profile.telegram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#7047EB] text-sm font-bold hover:underline block"
              >
                {profile.telegram}
              </a>
            </div>

            <div className="p-3.5 bg-[#F5F6FA] rounded-xl border border-[#E5E7EF]">
              <span className="text-[#667085] block mb-1">Состав команды:</span>
              <strong className="text-[#17171C] text-sm block">{profile.membersCount} инженера</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
