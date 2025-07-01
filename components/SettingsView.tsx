import React, { useState } from 'react';
import { Member, Status } from '../types';
import EditableText from './EditableText';
import { PlusIcon, EditIcon, TrashIcon } from './Icons';
import AddMemberModal from './AddMemberModal';
import AddStatusModal from './AddStatusModal';

interface SettingsViewProps {
  members: Member[];
  statuses: Status[];
  onUpdateMember: (memberId: string, field: 'name' | 'email', value: string) => void;
  onUpdateStatus: (updatedStatus: Status) => void;
  onAddMember: (newMemberData: Omit<Member, 'id' | 'avatar'>) => void;
  onAddStatus: (newStatusData: Omit<Status, 'id'>) => void;
  onDeleteMember: (memberId: string) => void;
  onDeleteStatus: (statusId: string) => void;
  onEditStatus: (status: Status) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    members, 
    statuses, 
    onUpdateMember, 
    onAddMember, 
    onAddStatus,
    onDeleteMember,
    onDeleteStatus,
    onEditStatus
}) => {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  
  const handleDeleteMemberClick = (member: Member) => {
    if (window.confirm(`Are you sure you want to delete ${member.name}? This will unassign them from all tasks.`)) {
        onDeleteMember(member.id);
    }
  }

  const handleDeleteStatusClick = (status: Status) => {
      if(window.confirm(`Are you sure you want to delete the "${status.label}" status? Tasks with this status might be affected.`)) {
          onDeleteStatus(status.id);
      }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Members Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
              <span>Team Members</span>
          </h2>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-50 group">
                  <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full"/>
                  <div className="flex-grow">
                      <EditableText 
                          initialValue={member.name}
                          onSave={(newValue) => onUpdateMember(member.id, 'name', newValue)}
                          className="font-semibold text-gray-800"
                          inputClassName="w-full bg-white border border-emerald-300 rounded px-2 py-1"
                      />
                      <EditableText 
                          initialValue={member.email}
                          onSave={(newValue) => onUpdateMember(member.id, 'email', newValue)}
                          className="text-sm text-gray-500"
                          inputClassName="w-full bg-white border border-emerald-300 rounded px-2 py-0.5 text-sm"
                      />
                  </div>
                   <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDeleteMemberClick(member)} title="Delete Member" className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
              </div>
            ))}
            <button 
              onClick={() => setIsAddingMember(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-md transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>
        
        {/* Statuses Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Project Statuses</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
            {statuses.map(status => (
              <div key={status.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-50 group">
                  <span className={`w-4 h-4 rounded-full ${status.color}`}></span>
                  <div className="flex-grow">
                      <p className="font-medium text-gray-700">{status.label}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEditStatus(status)} title="Edit Status" className="p-2 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50">
                            <EditIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => handleDeleteStatusClick(status)} title="Delete Status" className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
              </div>
            ))}
            <button 
              onClick={() => setIsAddingStatus(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-md transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Status</span>
            </button>
          </div>
        </div>
      </div>
      
      {isAddingMember && (
        <AddMemberModal 
          onClose={() => setIsAddingMember(false)}
          onAddMember={onAddMember}
        />
      )}
      {isAddingStatus && (
        <AddStatusModal
          onClose={() => setIsAddingStatus(false)}
          onAddStatus={onAddStatus}
        />
      )}
    </>
  );
};

export default SettingsView;