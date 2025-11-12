import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, parentEmail, weeklyData, activityData } = body;

    // Configure Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your regular password)
      },
    });

    // Calculate totals
    const totalQuestions = activityData.reduce((sum: number, day: any) => sum + day.questionsAsked, 0);
    const avgTimePerDay = Math.round(weeklyData.totalTimeSpent / 7);

    // Format the email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .metric-card { background: white; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .metric-value { font-size: 32px; font-weight: bold; color: #667eea; margin: 10px 0; }
            .metric-label { color: #6b7280; font-size: 14px; }
            .section-title { font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; color: #1f2937; }
            .list-item { background: white; padding: 12px; margin: 8px 0; border-left: 4px solid #667eea; border-radius: 4px; }
            .achievement { background: #ecfdf5; border-left-color: #10b981; }
            .growth-area { background: #eff6ff; border-left-color: #3b82f6; }
            .strength { background: #fef3c7; border-left-color: #f59e0b; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📚 Weekly Learning Report</h1>
            <p style="margin: 10px 0; font-size: 18px;">${userName}'s Progress Summary</p>
            <p style="margin: 5px 0; opacity: 0.9;">Week of ${new Date(weeklyData.weekStart).toLocaleDateString()} - ${new Date(weeklyData.weekEnd).toLocaleDateString()}</p>
          </div>
          
          <div class="content">
            <!-- Key Metrics -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div class="metric-card">
                <div class="metric-label">Study Time</div>
                <div class="metric-value">${Math.floor(weeklyData.totalTimeSpent / 60)}h ${weeklyData.totalTimeSpent % 60}m</div>
                <div class="metric-label">~${avgTimePerDay} min/day</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Questions Asked</div>
                <div class="metric-value">${totalQuestions}</div>
                <div class="metric-label">Active sessions</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-label">Subjects Practiced</div>
              <div class="metric-value">${weeklyData.subjectsStudied.length}</div>
              <div class="metric-label">${weeklyData.subjectsStudied.join(', ')}</div>
            </div>

            <!-- Notable Achievements -->
            <div class="section-title">🎉 Notable Achievements</div>
            ${weeklyData.notableAchievements.map((achievement: string) => `
              <div class="list-item achievement">✓ ${achievement}</div>
            `).join('')}

            <!-- Strengths Observed -->
            <div class="section-title">💪 Strengths Observed</div>
            ${weeklyData.strengthsObserved.map((strength: string) => `
              <div class="list-item strength">⭐ ${strength}</div>
            `).join('')}

            <!-- Areas for Growth -->
            <div class="section-title">🎯 Areas for Growth</div>
            ${weeklyData.areasForGrowth.map((area: string) => `
              <div class="list-item growth-area">→ ${area}</div>
            `).join('')}

            <!-- Daily Activity -->
            <div class="section-title">📅 This Week's Activity</div>
            ${activityData.map((activity: any) => `
              <div class="metric-card">
                <strong>${activity.subject}</strong> - ${new Date(activity.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                <br/>
                <span style="color: #6b7280; font-size: 14px;">
                  ${activity.questionsAsked} questions • ${activity.timeSpent} minutes • 
                  Topics: ${activity.topicsDiscussed.join(', ')}
                </span>
                <div style="margin-top: 10px; padding: 10px; background: #f3f4f6; border-radius: 4px; font-size: 14px;">
                  <strong>Learning Coach Insights:</strong> ${activity.aiNotes}
                </div>
              </div>
            `).join('')}

            <!-- Call to Action -->
            <div style="text-align: center; margin-top: 30px;">
              <p><strong>Weekly Summary Insight:</strong></p>
              <p style="color: #6b7280;">
                ${userName} is showing excellent progress this week! Particularly strong performance in mathematical reasoning 
                and consistent daily practice habits. Continue encouraging the current routine, and consider exploring more 
                challenging problems to build on current strengths.
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/parent-dashboard" class="button">
                View Full Dashboard →
              </a>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated weekly summary from NovaTutor Learning Coach</p>
            <p>© ${new Date().getFullYear()} NovaTutor. All rights reserved.</p>
            <p style="margin-top: 10px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/account" style="color: #667eea;">Manage Email Preferences</a>
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"NovaTutor Learning Coach" <${process.env.GMAIL_USER}>`,
      to: parentEmail,
      subject: `📚 ${userName}'s Weekly Learning Report - NovaTutor`,
      html: emailHtml,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Weekly report sent successfully!' 
    });

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

