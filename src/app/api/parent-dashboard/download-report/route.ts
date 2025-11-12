import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, weeklyData, activityData } = body;

    // Calculate totals
    const totalQuestions = activityData.reduce((sum: number, day: any) => sum + day.questionsAsked, 0);
    const avgTimePerDay = Math.round(weeklyData.totalTimeSpent / 7);

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.6; 
              color: #1f2937;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px; 
              text-align: center; 
              border-radius: 12px;
              margin-bottom: 30px;
            }
            .header h1 { font-size: 32px; margin-bottom: 10px; }
            .header p { font-size: 16px; opacity: 0.95; }
            .metrics { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 20px; 
              margin-bottom: 30px; 
            }
            .metric-card { 
              background: #f9fafb; 
              border: 2px solid #e5e7eb;
              border-radius: 12px; 
              padding: 24px; 
              text-align: center; 
            }
            .metric-value { 
              font-size: 36px; 
              font-weight: bold; 
              color: #667eea; 
              margin: 12px 0; 
            }
            .metric-label { 
              color: #6b7280; 
              font-size: 13px; 
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 600;
            }
            .metric-sublabel { 
              color: #9ca3af; 
              font-size: 12px; 
              margin-top: 5px;
            }
            .section { 
              background: white; 
              border: 2px solid #e5e7eb;
              border-radius: 12px; 
              padding: 24px; 
              margin-bottom: 24px; 
            }
            .section-title { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 16px; 
              color: #1f2937;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .list-item { 
              padding: 12px 16px; 
              margin: 10px 0; 
              border-left: 4px solid #667eea; 
              background: #f9fafb;
              border-radius: 4px;
            }
            .achievement { 
              background: #ecfdf5; 
              border-left-color: #10b981; 
            }
            .growth-area { 
              background: #eff6ff; 
              border-left-color: #3b82f6; 
            }
            .strength { 
              background: #fef3c7; 
              border-left-color: #f59e0b; 
            }
            .activity-card {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin: 15px 0;
            }
            .activity-header {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #1f2937;
            }
            .activity-meta {
              color: #6b7280;
              font-size: 13px;
              margin-bottom: 12px;
            }
            .topics {
              margin: 12px 0;
            }
            .topic-tag {
              display: inline-block;
              background: white;
              border: 1px solid #d1d5db;
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 12px;
              margin: 4px 4px 4px 0;
            }
            .ai-notes {
              background: #ede9fe;
              border-left: 4px solid #8b5cf6;
              padding: 12px 16px;
              border-radius: 4px;
              margin-top: 12px;
              font-size: 13px;
            }
            .ai-notes strong {
              color: #7c3aed;
            }
            .footer { 
              text-align: center; 
              padding-top: 30px; 
              margin-top: 30px;
              border-top: 2px solid #e5e7eb;
              color: #6b7280; 
              font-size: 12px; 
            }
            .page-break { page-break-after: always; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📚 Weekly Learning Report</h1>
            <p><strong>${userName}'s Progress Summary</strong></p>
            <p>Week of ${new Date(weeklyData.weekStart).toLocaleDateString()} - ${new Date(weeklyData.weekEnd).toLocaleDateString()}</p>
          </div>
          
          <!-- Key Metrics -->
          <div class="metrics">
            <div class="metric-card">
              <div class="metric-label">Study Time</div>
              <div class="metric-value">${Math.floor(weeklyData.totalTimeSpent / 60)}h ${weeklyData.totalTimeSpent % 60}m</div>
              <div class="metric-sublabel">~${avgTimePerDay} min/day</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Questions Asked</div>
              <div class="metric-value">${totalQuestions}</div>
              <div class="metric-sublabel">Active sessions</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Subjects</div>
              <div class="metric-value">${weeklyData.subjectsStudied.length}</div>
              <div class="metric-sublabel">${weeklyData.subjectsStudied.join(', ')}</div>
            </div>
          </div>

          <!-- Notable Achievements -->
          <div class="section">
            <div class="section-title">🎉 Notable Achievements</div>
            ${weeklyData.notableAchievements.map((achievement: string) => `
              <div class="list-item achievement">✓ ${achievement}</div>
            `).join('')}
          </div>

          <!-- Strengths Observed -->
          <div class="section">
            <div class="section-title">💪 Strengths Observed</div>
            ${weeklyData.strengthsObserved.map((strength: string) => `
              <div class="list-item strength">⭐ ${strength}</div>
            `).join('')}
          </div>

          <!-- Areas for Growth -->
          <div class="section">
            <div class="section-title">🎯 Areas for Growth</div>
            ${weeklyData.areasForGrowth.map((area: string) => `
              <div class="list-item growth-area">→ ${area}</div>
            `).join('')}
          </div>

          <!-- Daily Activity -->
          <div class="section">
            <div class="section-title">📅 Detailed Daily Activity</div>
            ${activityData.map((activity: any, index: number) => `
              <div class="activity-card">
                <div class="activity-header">${activity.subject}</div>
                <div class="activity-meta">
                  ${new Date(activity.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })} • ${activity.questionsAsked} questions • ${activity.timeSpent} minutes
                </div>
                <div class="topics">
                  <strong style="font-size: 13px;">Topics Covered:</strong>
                  <div style="margin-top: 6px;">
                    ${activity.topicsDiscussed.map((topic: string) => `
                      <span class="topic-tag">${topic}</span>
                    `).join('')}
                  </div>
                </div>
                <div class="ai-notes">
                  <strong>Learning Coach Insights:</strong> ${activity.aiNotes}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Weekly Summary -->
          <div class="section" style="background: #faf5ff; border-color: #e9d5ff;">
            <div class="section-title" style="color: #7c3aed;">📊 Weekly Summary Insight</div>
            <p style="font-size: 14px; line-height: 1.8;">
              ${userName} is showing excellent progress this week! Particularly strong performance in mathematical 
              reasoning and consistent daily practice habits. Our Learning Coach has observed improved problem-solving 
              approaches and growing independence. Continue encouraging the current routine, and consider exploring 
              more challenging word problems to build on current strengths.
            </p>
          </div>

          <div class="footer">
            <p><strong>Generated by NovaTutor Learning Coach</strong></p>
            <p>© ${new Date().getFullYear()} NovaTutor. All rights reserved.</p>
            <p style="margin-top: 10px;">This report was generated on ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}</p>
          </div>
        </body>
      </html>
    `;

    return NextResponse.json({ 
      success: true, 
      html: htmlContent,
      fileName: `${userName.replace(/\s+/g, '_')}_Weekly_Report_${new Date().toISOString().split('T')[0]}.html`
    });

  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate report', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

