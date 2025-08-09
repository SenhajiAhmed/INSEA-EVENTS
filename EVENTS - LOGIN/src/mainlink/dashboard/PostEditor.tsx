import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { PostData, Post } from '../../types';
import { 
  Snowflake, 
  MapPin, 
  Users, 
  Clock, 
  Award, 
  Star, 
  Thermometer, 
  Shield,
  Zap,
  Calendar,
  Heart,
  Bookmark
} from 'lucide-react';

// Icon mapping for technical specifications
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Snowflake,
  MapPin,
  Users,
  Clock,
  Award,
  Star,
  Thermometer,
  Shield,
  Zap,
  Calendar,
  Heart,
  Bookmark
};

// Available icon options for selection
const availableIcons = Object.keys(iconMap);

interface PostEditorProps {
  post?: Post | null;
  onSave: (post: PostData) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const PostEditor: React.FC<PostEditorProps> = ({ post, onSave, onCancel, isSaving }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [technicalSpecs, setTechnicalSpecs] = useState('');
  const [quickInfo, setQuickInfo] = useState('');
  const [eventProgram, setEventProgram] = useState('');
  
  // New state for configurable table-like designs
  const [quickInfoFields, setQuickInfoFields] = useState([
    { key: 'Published', value: new Date().toLocaleDateString(), enabled: true },
    { key: 'Location', value: 'Mega Mall Center', enabled: true },
    { key: 'Duration', value: 'All Day Event', enabled: true },
    { key: 'Age Range', value: '3+ Years', enabled: true },
    { key: 'Price', value: 'Free Entry', enabled: false },
    { key: 'Category', value: 'Sports & Recreation', enabled: false },
    { key: 'Organizer', value: 'INSEA Events', enabled: false },
    { key: 'Contact', value: '+1 234 567 8900', enabled: false }
  ]);

  const [technicalSpecFields, setTechnicalSpecFields] = useState([
    { icon: 'Snowflake', label: 'Ice Quality', value: 'Olympic Grade', category: 'Surface', enabled: true },
    { icon: 'MapPin', label: 'Rink Size', value: '60m x 30m', category: 'Dimensions', enabled: true },
    { icon: 'Users', label: 'Capacity', value: '200 skaters', category: 'Capacity', enabled: true },
    { icon: 'Clock', label: 'Session Length', value: '2 hours', category: 'Timing', enabled: true },
    { icon: 'Award', label: 'Equipment', value: 'Professional', category: 'Quality', enabled: true },
    { icon: 'Star', label: 'Instructors', value: 'Certified', category: 'Staff', enabled: true },
    { icon: 'Thermometer', label: 'Temperature', value: '-5°C to -2°C', category: 'Environment', enabled: false },
    { icon: 'Shield', label: 'Safety Level', value: 'Maximum', category: 'Security', enabled: false }
  ]);

  const [scheduleFields, setScheduleFields] = useState([
    { time: '10:00 AM', activity: 'Rink Opens - Morning Session', description: 'Perfect for early birds and families', enabled: true },
    { time: '12:00 PM', activity: 'Lunch Break & Rink Maintenance', description: 'Ice resurfacing and equipment check', enabled: true },
    { time: '1:00 PM', activity: 'Afternoon Public Skating', description: 'Open session for all skill levels', enabled: true },
    { time: '3:00 PM', activity: 'Beginner Lessons', description: 'Professional instruction for new skaters', enabled: true },
    { time: '5:00 PM', activity: 'Advanced Skating Session', description: 'For experienced skaters only', enabled: true },
    { time: '7:00 PM', activity: 'Evening Family Skate', description: 'Music and special lighting effects', enabled: true },
    { time: '9:00 PM', activity: 'Late Night Session', description: 'Teen and adult focused skating', enabled: false },
    { time: '11:00 PM', activity: 'Midnight Special', description: 'Extended hours for night owls', enabled: false }
  ]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content || '');
      setTechnicalSpecs(post.technical_specs || '');
      setQuickInfo(post.quick_info || '');
      setEventProgram(post.event_program || '');
      
      // Parse existing content if available
      try {
        if (post.quick_info) {
          const parsed = JSON.parse(post.quick_info);
          if (Array.isArray(parsed)) setQuickInfoFields(parsed);
        }
        if (post.technical_specs) {
          const parsed = JSON.parse(post.technical_specs);
          if (Array.isArray(parsed)) setTechnicalSpecFields(parsed);
        }
        if (post.event_program) {
          const parsed = JSON.parse(post.event_program);
          if (Array.isArray(parsed)) setScheduleFields(parsed);
        }
      } catch (e) {
        // If parsing fails, keep default values
      }
    } else {
      setTitle('');
      setContent('');
      setTechnicalSpecs('');
      setQuickInfo('');
      setEventProgram('');
    }
  }, [post]);

  const handleSave = () => {
    // Convert configurable fields to JSON strings for storage
    const quickInfoJson = JSON.stringify(quickInfoFields.filter(f => f.enabled));
    const technicalSpecsJson = JSON.stringify(technicalSpecFields.filter(f => f.enabled));
    const eventProgramJson = JSON.stringify(scheduleFields.filter(f => f.enabled));
    
    onSave({ 
      ...post, 
      title, 
      content, 
      technical_specs: technicalSpecsJson,
      quick_info: quickInfoJson,
      event_program: eventProgramJson
    });
  };

  const toggleField = (section: string, index: number) => {
    if (section === 'quickInfo') {
      const newFields = [...quickInfoFields];
      newFields[index].enabled = !newFields[index].enabled;
      setQuickInfoFields(newFields);
    } else if (section === 'technicalSpecs') {
      const newFields = [...technicalSpecFields];
      newFields[index].enabled = !newFields[index].enabled;
      setTechnicalSpecFields(newFields);
    } else if (section === 'schedule') {
      const newFields = [...scheduleFields];
      newFields[index].enabled = !newFields[index].enabled;
      setScheduleFields(newFields);
    }
  };

  const updateField = (section: string, index: number, field: string, value: string) => {
    if (section === 'quickInfo') {
      const newFields = [...quickInfoFields];
      newFields[index][field as keyof typeof newFields[0]] = value;
      setQuickInfoFields(newFields);
    } else if (section === 'technicalSpecs') {
      const newFields = [...technicalSpecFields];
      newFields[index][field as keyof typeof newFields[0]] = value;
      setTechnicalSpecFields(newFields);
    } else if (section === 'schedule') {
      const newFields = [...scheduleFields];
      newFields[index][field as keyof typeof newFields[0]] = value;
      setScheduleFields(newFields);
    }
  };

  const addCustomField = (section: string) => {
    if (section === 'quickInfo') {
      setQuickInfoFields([...quickInfoFields, { key: '', value: '', enabled: true }]);
    } else if (section === 'technicalSpecs') {
      setTechnicalSpecFields([...technicalSpecFields, { icon: 'Star', label: '', value: '', category: '', enabled: true }]);
    } else if (section === 'schedule') {
      setScheduleFields([...scheduleFields, { time: '', activity: '', description: '', enabled: true }]);
    }
  };

  const removeField = (section: string, index: number) => {
    if (section === 'quickInfo') {
      setQuickInfoFields(quickInfoFields.filter((_, i) => i !== index));
    } else if (section === 'technicalSpecs') {
      setTechnicalSpecFields(technicalSpecFields.filter((_, i) => i !== index));
    } else if (section === 'schedule') {
      setScheduleFields(scheduleFields.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#232135] p-6 rounded-lg shadow-xl w-full max-w-4xl text-white max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{post ? 'Edit Post' : 'Create New Post'}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="bg-[#181824] border-gray-600"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">Content</label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              className="bg-[#181824] border-gray-600 min-h-[200px]"
            />
          </div>

          <div>
            <label htmlFor="technicalSpecs" className="block text-sm font-medium text-gray-300 mb-1">Technical Specifications</label>
            <div className="space-y-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Configure Technical Spec Fields</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => addCustomField('technicalSpecs')}
                  className="h-8 px-2 text-xs"
                >
                  Add Field
                </Button>
              </div>
              {technicalSpecFields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-800/30 rounded border border-gray-600/50">
                  <input
                    type="checkbox"
                    checked={field.enabled}
                    onChange={() => toggleField('technicalSpecs', index)}
                    className="rounded border-gray-600 bg-gray-700 text-purple-500"
                  />
                  <select
                    value={field.icon}
                    onChange={(e) => updateField('technicalSpecs', index, 'icon', e.target.value)}
                    className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  >
                    {availableIcons.map(iconName => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField('technicalSpecs', index, 'label', e.target.value)}
                    placeholder="Label (e.g., Ice Quality)"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateField('technicalSpecs', index, 'value', e.target.value)}
                    placeholder="Value (e.g., Olympic Grade)"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                  <input
                    type="text"
                    value={field.category}
                    onChange={(e) => updateField('technicalSpecs', index, 'category', e.target.value)}
                    placeholder="Category (e.g., Surface)"
                    className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeField('technicalSpecs', index)}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Configure which technical specification fields to display and their values</p>
            
            {/* Preview of Technical Specs */}
            <div className="mt-4 p-4 bg-gray-800/20 rounded-lg border border-gray-600/30">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Preview:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {technicalSpecFields.filter(f => f.enabled).map((field, index) => {
                  const IconComponent = iconMap[field.icon] || Star;
                  return (
                    <div key={index} className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{field.label}</div>
                          <div className="text-purple-400 text-xs font-semibold">{field.value}</div>
                        </div>
                      </div>
                      {field.category && (
                        <div className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full inline-block">
                          {field.category}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="quickInfo" className="block text-sm font-medium text-gray-300 mb-1">Quick Info</label>
            <div className="space-y-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Configure Quick Info Fields</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => addCustomField('quickInfo')}
                  className="h-8 px-2 text-xs"
                >
                  Add Field
                </Button>
              </div>
              {quickInfoFields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-800/30 rounded border border-gray-600/50">
                  <input
                    type="checkbox"
                    checked={field.enabled}
                    onChange={() => toggleField('quickInfo', index)}
                    className="rounded border-gray-600 bg-gray-700 text-purple-500"
                  />
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => updateField('quickInfo', index, 'key', e.target.value)}
                    placeholder="Field name (e.g., Location)"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateField('quickInfo', index, 'value', e.target.value)}
                    placeholder="Field value"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeField('quickInfo', index)}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Configure which quick info fields to display and their values</p>
            
            {/* Preview of Quick Info */}
            <div className="mt-4 p-4 bg-gray-800/20 rounded-lg border border-gray-600/30">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Preview:</h4>
              <div className="space-y-2">
                {quickInfoFields.filter(f => f.enabled).map((field, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-700/30 rounded border border-gray-600/50">
                    <span className="text-white/70 text-sm">{field.key}:</span>
                    <span className="text-white text-sm">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="eventProgram" className="block text-sm font-medium text-gray-300 mb-1">Event Program & Schedule</label>
            <div className="space-y-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Configure Schedule Fields</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => addCustomField('schedule')}
                  className="h-8 px-2 text-xs"
                >
                  Add Field
                </Button>
              </div>
              {scheduleFields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-800/30 rounded border border-gray-600/50">
                  <input
                    type="checkbox"
                    checked={field.enabled}
                    onChange={() => toggleField('schedule', index)}
                    className="rounded border-gray-600 bg-gray-700 text-purple-500"
                  />
                  <input
                    type="text"
                    value={field.time}
                    onChange={(e) => updateField('schedule', index, 'time', e.target.value)}
                    placeholder="Time (e.g., 10:00 AM)"
                    className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                  <input
                    type="text"
                    value={field.activity}
                    onChange={(e) => updateField('schedule', index, 'activity', e.target.value)}
                    placeholder="Activity (e.g., Rink Opens)"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                  <input
                    type="text"
                    value={field.description}
                    onChange={(e) => updateField('schedule', index, 'description', e.target.value)}
                    placeholder="Description"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeField('schedule', index)}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Configure which schedule items to display and their details</p>
            
            {/* Preview of Event Program & Schedule */}
            <div className="mt-4 p-4 bg-gray-800/20 rounded-lg border border-gray-600/30">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Preview:</h4>
              <div className="space-y-3">
                {scheduleFields.filter(f => f.enabled).map((field, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                    <div className="w-3 h-3 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-purple-400 text-sm font-medium">{field.time}</span>
                        <span className="text-white text-sm font-medium">-</span>
                        <span className="text-white text-sm font-medium">{field.activity}</span>
                      </div>
                      {field.description && (
                        <p className="text-white/70 text-xs leading-relaxed">{field.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
