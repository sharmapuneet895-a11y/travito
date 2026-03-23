import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { User, Mail, Phone, Trash2, Edit2, Save, X, LogOut, Heart, FileText, Shield, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UserProfile = () => {
  const { user, isLoggedIn, updateUser, deleteAccount, logout, setShowAuthModal } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedChecklists, setSavedChecklists] = useState([]);
  const [expandedChecklist, setExpandedChecklist] = useState(null);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Fetch saved checklists
  useEffect(() => {
    if (isLoggedIn && user?.user_id) {
      fetchSavedChecklists();
    }
  }, [isLoggedIn, user?.user_id]);

  const fetchSavedChecklists = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/user/${user.user_id}/document-checklists`);
      setSavedChecklists(response.data.data || []);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    if (!window.confirm('Are you sure you want to delete this checklist?')) return;
    
    setChecklistLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/user/${user.user_id}/document-checklists/${checklistId}`);
      setSavedChecklists(prev => prev.filter(c => c.id !== checklistId));
    } catch (error) {
      console.error('Error deleting checklist:', error);
      alert('Failed to delete checklist');
    } finally {
      setChecklistLoading(false);
    }
  };

  const handleUpdateChecklist = async (checklistId, checkedItems, progress) => {
    setChecklistLoading(true);
    try {
      const checklist = savedChecklists.find(c => c.id === checklistId);
      await axios.put(`${BACKEND_URL}/api/user/${user.user_id}/document-checklists/${checklistId}`, {
        country: checklist.country,
        visa_type: checklist.visa_type,
        checklist: checklist.checklist,
        checked_items: checkedItems,
        progress: progress
      });
      
      // Update local state
      setSavedChecklists(prev => prev.map(c => 
        c.id === checklistId 
          ? { ...c, checked_items: checkedItems, progress: progress, updated_at: new Date().toISOString() }
          : c
      ));
    } catch (error) {
      console.error('Error updating checklist:', error);
      alert('Failed to update checklist');
    } finally {
      setChecklistLoading(false);
    }
  };

  const toggleCheckItem = (checklistId, itemKey) => {
    const checklist = savedChecklists.find(c => c.id === checklistId);
    if (!checklist) return;
    
    const newCheckedItems = { ...checklist.checked_items, [itemKey]: !checklist.checked_items?.[itemKey] };
    const totalItems = (checklist.checklist?.mandatory_documents?.length || 0) + 
                       (checklist.checklist?.supporting_documents?.length || 0);
    const checkedCount = Object.values(newCheckedItems).filter(Boolean).length;
    const newProgress = Math.round((checkedCount / totalItems) * 100);
    
    handleUpdateChecklist(checklistId, newCheckedItems, newProgress);
  };

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
        <div className="max-w-lg mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Create Your Profile</h1>
            <p className="text-gray-300 mb-6">
              Sign up to save your wishlist, check visa eligibility, and access personalized travel tools.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
              data-testid="profile-login-btn"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const startEditing = () => {
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone
    });
    setIsEditing(true);
    setError('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    const result = await updateUser(editData);
    setLoading(false);
    
    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteAccount();
    setLoading(false);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Header */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white" data-testid="profile-name">
                    {user.name}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Profile Details</h2>
              {!isEditing ? (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  data-testid="edit-profile-btn"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-500 transition-all"
                    data-testid="save-profile-btn"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/20 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Full Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-white font-medium">{user.name}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Email Address</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-white font-medium">{user.email}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Mobile Number</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-white font-medium">{user.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Travel Data</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/wishlist')}
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                data-testid="goto-wishlist"
              >
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Wishlist</p>
                  <p className="text-gray-400 text-sm">{wishlist?.length || 0} countries</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/visa')}
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Visa Checks</p>
                  <p className="text-gray-400 text-sm">{user.visa_checks?.length || 0} checks</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/visa')}
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Checklists</p>
                  <p className="text-gray-400 text-sm">{savedChecklists?.length || 0} saved</p>
                </div>
              </button>
            </div>
          </div>

          {/* Saved Document Checklists */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Saved Checklists
              </h2>
              <button
                onClick={fetchSavedChecklists}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                disabled={checklistLoading}
                data-testid="refresh-checklists-btn"
              >
                <RefreshCw className={`w-4 h-4 ${checklistLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {savedChecklists.length > 0 ? (
              <div className="space-y-3">
                {savedChecklists.map((checklist) => (
                  <div
                    key={checklist.id}
                    className="bg-white/5 rounded-xl overflow-hidden"
                  >
                    {/* Checklist Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => setExpandedChecklist(expandedChecklist === checklist.id ? null : checklist.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {checklist.country?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{checklist.country}</p>
                            <p className="text-gray-400 text-sm capitalize">{checklist.visa_type} Visa</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Progress */}
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all"
                                style={{ width: `${checklist.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-400">{checklist.progress || 0}%</span>
                          </div>
                          {expandedChecklist === checklist.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created: {new Date(checklist.created_at).toLocaleDateString()}
                        </span>
                        {checklist.updated_at && (
                          <span>Updated: {new Date(checklist.updated_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Expanded Checklist Content */}
                    {expandedChecklist === checklist.id && (
                      <div className="px-4 pb-4 border-t border-white/10">
                        {/* Mandatory Documents */}
                        {checklist.checklist?.mandatory_documents?.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-emerald-400 mb-2">Mandatory Documents</h4>
                            <div className="space-y-2">
                              {checklist.checklist.mandatory_documents.map((doc, idx) => {
                                const itemKey = `mandatory_${idx}`;
                                const isChecked = checklist.checked_items?.[itemKey];
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => toggleCheckItem(checklist.id, itemKey)}
                                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                      isChecked ? 'bg-emerald-500/20' : 'bg-white/5 hover:bg-white/10'
                                    }`}
                                  >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                      isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'
                                    }`}>
                                      {isChecked && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${isChecked ? 'text-emerald-300 line-through' : 'text-white'}`}>
                                        {doc.name}
                                      </p>
                                      <p className="text-xs text-gray-400">{doc.description}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Supporting Documents */}
                        {checklist.checklist?.supporting_documents?.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-blue-400 mb-2">Supporting Documents</h4>
                            <div className="space-y-2">
                              {checklist.checklist.supporting_documents.map((doc, idx) => {
                                const itemKey = `supporting_${idx}`;
                                const isChecked = checklist.checked_items?.[itemKey];
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => toggleCheckItem(checklist.id, itemKey)}
                                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                      isChecked ? 'bg-blue-500/20' : 'bg-white/5 hover:bg-white/10'
                                    }`}
                                  >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                      isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-500'
                                    }`}>
                                      {isChecked && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${isChecked ? 'text-blue-300 line-through' : 'text-white'}`}>
                                        {doc.name}
                                      </p>
                                      <p className="text-xs text-gray-400">{doc.description}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end mt-4 pt-4 border-t border-white/10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChecklist(checklist.id);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                            disabled={checklistLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Checklist
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No saved checklists yet</p>
                <p className="text-gray-500 text-sm mt-1">Generate a document checklist from the homepage to save it here</p>
              </div>
            )}
          </div>

          {/* Delete Account */}
          <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/20">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
            <p className="text-gray-400 text-sm mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                data-testid="delete-account-btn"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            ) : (
              <div className="bg-red-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Are you absolutely sure?</p>
                    <p className="text-gray-400 text-sm">
                      This will permanently delete your profile, wishlist, and all saved data.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-all"
                    data-testid="confirm-delete-btn"
                  >
                    <Trash2 className="w-4 h-4" />
                    Yes, Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
