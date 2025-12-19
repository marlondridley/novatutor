'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Settings, Save, CheckCircle2 } from 'lucide-react';
import { 
  PARENT_CONTROLS,
  GradeLevel,
  EFMode,
  Modality,
  SafetyMode,
  ToneBias,
} from '@/ai/behavior-control';
import { useBehaviorFlags } from '@/hooks/use-behavior-flags';

/**
 * 👨‍👩‍👧 Parent Settings - Control AI Behavior Through Flags
 * 
 * COPPA-Compliant: Parents control all AI behavior through structured flags, not prompts.
 * This ensures predictable, auditable, and safe AI interactions for kids.
 */
export default function ParentSettingsPage() {
  const { behaviorFlags, setBehaviorFlags } = useBehaviorFlags();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Save confirmation (flags are auto-saved by the hook)
  const handleSave = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-semibold">Parent Settings</h1>
          <p className="text-sm text-muted-foreground">
            Control how BestTutorEver teaches your child
          </p>
        </div>
      </div>

      {/* Explainer Card */}
      <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            How This Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>These settings control AI behavior without changing prompts.</strong>
          </p>
          <p>
            Instead of free-text instructions (which can be unpredictable), we use structured 
            flags that ensure consistent, safe, and age-appropriate tutoring.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            ✅ COPPA-compliant • Auditable • Predictable • Parent-controlled
          </p>
        </CardContent>
      </Card>

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Grade Level */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grade Level</CardTitle>
            <CardDescription>
              {PARENT_CONTROLS.gradeLevel.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Current Grade</Label>
              <Select
                value={behaviorFlags.gradeLevel.toString()}
                onValueChange={(value) => 
                  setBehaviorFlags({ ...behaviorFlags, gradeLevel: parseInt(value) as GradeLevel })
                }
              >
                <SelectTrigger id="gradeLevel">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {PARENT_CONTROLS.gradeLevel.options.map(grade => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* EF Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Planning Support</CardTitle>
            <CardDescription>
              {PARENT_CONTROLS.efMode.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="efMode">Support Level</Label>
              <Select
                value={behaviorFlags.efMode}
                onValueChange={(value) => 
                  setBehaviorFlags({ ...behaviorFlags, efMode: value as EFMode })
                }
              >
                <SelectTrigger id="efMode">
                  <SelectValue placeholder="Select support level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PARENT_CONTROLS.efMode.options).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Modality */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Primary Mode</CardTitle>
            <CardDescription>
              {PARENT_CONTROLS.modality.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="modality">Interaction Mode</Label>
              <Select
                value={behaviorFlags.modality}
                onValueChange={(value) => 
                  setBehaviorFlags({ ...behaviorFlags, modality: value as Modality })
                }
              >
                <SelectTrigger id="modality">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PARENT_CONTROLS.modality.options).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Safety Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content Safety</CardTitle>
            <CardDescription>
              {PARENT_CONTROLS.safetyMode.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="safetyMode">Safety Level</Label>
              <Select
                value={behaviorFlags.safetyMode}
                onValueChange={(value) => 
                  setBehaviorFlags({ ...behaviorFlags, safetyMode: value as SafetyMode })
                }
              >
                <SelectTrigger id="safetyMode">
                  <SelectValue placeholder="Select safety level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PARENT_CONTROLS.safetyMode.options).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                      {key === 'strict' && (
                        <Badge variant="secondary" className="ml-2">Recommended</Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tone Bias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emotional Tone</CardTitle>
            <CardDescription>
              {PARENT_CONTROLS.toneBias.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="toneBias">Tone Style</Label>
              <Select
                value={behaviorFlags.toneBias}
                onValueChange={(value) => 
                  setBehaviorFlags({ ...behaviorFlags, toneBias: value as ToneBias })
                }
              >
                <SelectTrigger id="toneBias">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PARENT_CONTROLS.toneBias.options).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                      {key === 'encouraging' && (
                        <Badge variant="secondary" className="ml-2">Recommended</Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Current Settings Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Current Configuration</CardTitle>
            <CardDescription>
              These settings are applied to all AI interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Grade Level</p>
                <p className="font-semibold">Grade {behaviorFlags.gradeLevel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Planning Support</p>
                <p className="font-semibold capitalize">{behaviorFlags.efMode}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Primary Mode</p>
                <p className="font-semibold capitalize">{behaviorFlags.modality}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Safety Level</p>
                <p className="font-semibold capitalize">{behaviorFlags.safetyMode}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tone</p>
                <p className="font-semibold capitalize">{behaviorFlags.toneBias}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Response Length</p>
                <p className="font-semibold capitalize">{behaviorFlags.verbosity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaving || saved}
          size="lg"
          className="gap-2"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </Button>
        
        {saved && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Settings saved successfully
          </p>
        )}
      </div>

      {/* Info Footer */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            How are these settings used?
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• These flags control AI behavior in real-time</li>
            <li>• Changes take effect immediately</li>
            <li>• Settings are stored locally on your device</li>
            <li>• You can adjust these anytime based on your child&apos;s needs</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}

