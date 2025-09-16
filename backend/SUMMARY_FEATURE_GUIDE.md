# 📊 Meeting Summary Feature - Implementation Guide

## 🎯 Overview

The Meeting Summary feature automatically generates comprehensive summaries of meeting retrospectives using Gemini AI and emails them to the meeting host. This feature includes:

- **Automatic Summary Generation**: Triggers when all participants submit retrospectives
- **Time-Based Generation**: Generates summaries 30 minutes before meeting time
- **Manual Generation**: API endpoint for manual summary generation
- **Text File Generation**: Creates detailed .txt files with complete analysis
- **Email Integration**: Sends summaries with attachments to meeting hosts
- **Smart Scheduling**: Background cron jobs for time-based triggers

## 🚀 Installation

### 1. Install New Dependencies

```bash
cd backend
npm install node-cron@^3.0.3
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Existing variables (keep these)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_password
SMTP_FROM=noreply@yourdomain.com

# Gemini API (if not already set)
GEMINI_API_KEY=your_gemini_api_key

# Optional: Summary feature settings
SUMMARY_GENERATION_ENABLED=true
```

### 3. Directory Structure

The following new files have been added:

```
backend/
├── models/
│   └── Summary.js                    # Summary data model
├── controllers/
│   └── summaryController.js          # Summary business logic
├── routes/
│   └── summaryRoutes.js              # Summary API routes
├── utils/
│   ├── summarizer.js                 # Gemini AI integration
│   ├── fileGenerator.js              # Text file generation
│   └── scheduler.js                  # Time-based scheduling
├── generated-files/                  # Temporary summary files
│   └── .gitkeep
└── SUMMARY_FEATURE_GUIDE.md          # This guide
```

## 🔧 API Endpoints

### 1. Generate Summary (Manual Trigger)
```http
POST /api/summaries/:meetingId/generate
Content-Type: application/json

{
  "triggerReason": "manual"  // Optional: "manual", "all_submitted", "time_based"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Summary generation initiated",
  "summary": {
    "id": "summary_id",
    "status": "generating",
    "generatedAt": "2024-01-15T10:00:00Z",
    "triggerReason": "manual"
  }
}
```

### 2. Get Summary Status
```http
GET /api/summaries/:meetingId
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "id": "summary_id",
    "status": "completed",
    "summaryText": "Generated summary text...",
    "generatedAt": "2024-01-15T10:00:00Z",
    "triggerReason": "all_submitted",
    "emailSent": true,
    "emailSentAt": "2024-01-15T10:05:00Z",
    "fileName": "meeting-summary-MTG123.txt",
    "meeting": {
      "meetingId": "MTG123",
      "title": "Project Planning",
      "hostEmail": "host@company.com"
    }
  }
}
```

### 3. List All Summaries for Meeting
```http
GET /api/summaries/:meetingId/list
```

## 🔄 How It Works

### Automatic Triggers

#### 1. All Participants Submitted
- **When**: Last participant submits retrospective
- **Action**: Automatically generates summary
- **Trigger**: `checkAndTriggerSummary()` called after retrospective submission

#### 2. Time-Based (30 minutes before meeting)
- **When**: Meeting is scheduled to start in 30 minutes
- **Action**: Generates summary if not already generated
- **Trigger**: Cron job runs every 5 minutes

### Summary Generation Process

1. **Validation**: Check if meeting exists and has retrospectives
2. **Gemini AI**: Send all retrospectives to Gemini for analysis
3. **Text File**: Generate detailed .txt file with complete analysis
4. **Email**: Send summary with attachment to meeting host
5. **Database**: Store summary record with status and metadata
6. **Cleanup**: Schedule file deletion after 24 hours

### Generated Text File Content

```
MEETING SUMMARY REPORT
=====================

Meeting Information:
-------------------
Meeting ID: MTG1A2B3C4D5E6F
Meeting Title: Project Planning
Meeting Time: 2024-01-15 10:00:00
Platform: Google Meet
Host Email: host@company.com
Total Participants: 3
Summary Generated: 2024-01-15 10:30:00
Trigger Reason: all_submitted

EXECUTIVE SUMMARY:
-----------------
[AI-generated comprehensive summary]

DETAILED RETROSPECTIVE FEEDBACK:
--------------------------------
[Individual participant feedback with scores]

RECOMMENDATIONS:
---------------
[Action items and improvement suggestions]
```

## 📧 Email Features

### Summary Email Content
- **Professional HTML Design**: Clean, responsive email template
- **Meeting Details**: ID, title, platform, generation time
- **Summary Preview**: First 500 characters of summary
- **File Attachment**: Complete .txt file with detailed analysis
- **Trigger Information**: Shows why summary was generated

### Email Template Features
- 📊 Visual indicators and icons
- 🎨 Color-coded sections
- 📎 Clear attachment information
- 📱 Mobile-responsive design

## ⚙️ Configuration

### Scheduler Settings
- **Time-based Check**: Every 5 minutes
- **File Cleanup**: Every hour
- **File Retention**: 24 hours

### Gemini AI Settings
- **Max Tokens**: 2000
- **Temperature**: 0.7
- **Prompt Engineering**: Optimized for meeting analysis

## 🐛 Troubleshooting

### Common Issues

#### 1. Summary Not Generated
- Check if all participants have submitted retrospectives
- Verify Gemini API key is set correctly
- Check server logs for error messages

#### 2. Email Not Sent
- Verify SMTP configuration in .env
- Check if host email is valid
- Ensure email service is not blocked

#### 3. File Generation Failed
- Check if `generated-files` directory exists
- Verify file system permissions
- Check available disk space

### Debug Logs
The system logs detailed information about:
- Summary generation process
- Email sending status
- File operations
- Error conditions

## 🔒 Security Considerations

- **File Cleanup**: Temporary files are automatically deleted
- **Email Validation**: Host email is validated before sending
- **Error Handling**: Graceful degradation if services fail
- **Rate Limiting**: Built-in protection against spam

## 📈 Monitoring

### Database Collections
- **summaries**: Stores all generated summaries
- **meetings**: Links to meeting information
- **participants**: Tracks participant status
- **retrospectives**: Source data for summaries

### Status Tracking
- **generating**: Summary is being created
- **completed**: Summary generated and emailed
- **failed**: Error occurred during generation

## 🚀 Usage Examples

### Frontend Integration

```javascript
// Check summary status
const checkSummary = async (meetingId) => {
  const response = await fetch(`/api/summaries/${meetingId}`);
  const data = await response.json();
  return data.summary;
};

// Manually trigger summary
const triggerSummary = async (meetingId) => {
  const response = await fetch(`/api/summaries/${meetingId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ triggerReason: 'manual' })
  });
  return response.json();
};
```

### Backend Integration

```javascript
// Import summary functions
import { generateSummaryForMeeting, checkAndTriggerSummary } from './controllers/summaryController.js';

// Generate summary programmatically
const summary = await generateSummaryForMeeting(meetingId, 'manual');

// Check if summary should be triggered
await checkAndTriggerSummary(meetingId);
```

## ✅ Testing

### Test the Feature

1. **Create a meeting** with participants
2. **Submit retrospectives** from all participants
3. **Check summary generation** via API
4. **Verify email delivery** to host
5. **Download and review** generated text file

### API Testing

```bash
# Test manual summary generation
curl -X POST http://localhost:5000/api/summaries/MTG123/generate \
  -H "Content-Type: application/json" \
  -d '{"triggerReason": "manual"}'

# Check summary status
curl http://localhost:5000/api/summaries/MTG123
```

## 🎉 Success!

The Meeting Summary feature is now fully integrated into your application. It will automatically:

- ✅ Generate summaries when all participants submit retrospectives
- ✅ Create summaries 30 minutes before meeting time
- ✅ Send professional emails with detailed reports
- ✅ Clean up temporary files automatically
- ✅ Provide comprehensive meeting analysis

The feature is production-ready and includes proper error handling, logging, and monitoring capabilities.
