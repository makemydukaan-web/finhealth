import { motion } from "framer-motion";
import { AssessmentResult } from "@/lib/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultsViewProps {
  result: AssessmentResult;
}

export function ResultsView({ result }: ResultsViewProps) {
  const data = [
    { name: 'Equity', value: result.allocation.equity, color: 'var(--color-chart-1)' },
    { name: 'Debt', value: result.allocation.debt, color: 'var(--color-chart-2)' },
    { name: 'Gold', value: result.allocation.gold, color: 'var(--color-chart-4)' },
  ];

  const getHealthColor = (score: number) => {
    if (score < 40) return "text-red-500";
    if (score < 75) return "text-yellow-500";
    return "text-green-600";
  };

  const getHealthLabel = (score: number) => {
    if (score < 40) return "Needs Attention";
    if (score < 75) return "Good Start";
    return "Excellent";
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-8 pb-20 space-y-8"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Your Financial Health Report</h2>
        <p className="text-muted-foreground">Personalized recommendations based on your profile</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Health Score Card */}
        <Card className="overflow-hidden border-none shadow-lg shadow-gray-200/50">
          <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Financial Health Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-gray-100"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * result.health_score) / 100}
                  className={`${getHealthColor(result.health_score)} transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${getHealthColor(result.health_score)}`}>
                  {result.health_score}
                </span>
                <span className="text-sm font-medium text-muted-foreground mt-1">
                  / 100
                </span>
              </div>
            </div>
            <p className={`mt-4 font-semibold ${getHealthColor(result.health_score)}`}>
              {getHealthLabel(result.health_score)}
            </p>
          </CardContent>
        </Card>

        {/* Asset Allocation Card */}
        <Card className="overflow-hidden border-none shadow-lg shadow-gray-200/50">
          <CardHeader className="bg-gradient-to-br from-secondary/10 to-transparent pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Recommended Allocation</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value, entry: any) => (
                    <span className="text-sm font-medium ml-1 text-foreground">
                      {value} ({entry.payload.value}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Fund */}
      <Card className="bg-blue-50/50 border-blue-100">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full mt-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-1">Emergency Fund Target</h3>
            <p className="text-3xl font-bold text-blue-700 mb-2">
              ₹{(result.emergency_fund / 100000).toFixed(1)} Lakhs
            </p>
            <p className="text-blue-600/80 text-sm">
              Keep this amount in a liquid fund or high-interest savings account. It covers 6 months of expenses.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/50">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          Your Action Plan
        </h3>
        <div className="space-y-4">
          {result.action_items.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="mt-0.5 min-w-[20px]">
                <div className="w-5 h-5 rounded border-2 border-primary/40 flex items-center justify-center">
                  {/* Empty checkbox for visual */}
                </div>
              </div>
              <p className="text-foreground/90 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      <div className="bg-muted/30 p-6 rounded-xl border border-dashed border-muted-foreground/20">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Advisor Note</h4>
        <p className="text-foreground/80 italic">"{result.reasoning}"</p>
      </div>

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8 text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
        <h3 className="text-2xl font-bold mb-3 relative z-10">Want a detailed roadmap?</h3>
        <p className="text-gray-300 mb-8 max-w-lg mx-auto relative z-10">
          Get a 1-on-1 consultation with a SEBI registered investment advisor to execute this plan.
        </p>
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-white font-bold px-8 h-14 rounded-full shadow-lg shadow-primary/25 relative z-10"
        >
          Book 30-min Call for ₹999
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
}
