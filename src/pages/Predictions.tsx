import { useState, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { calculatePredictions, PredictionResult } from '@/lib/predictions';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';
import { TrendingUp, TrendingDown, Wallet, Loader2, BrainCircuit, PlusCircle, AlertCircle, Sparkles } from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Predictions() {
    const { transactions } = useTransactions();
    const [predictions, setPredictions] = useState<PredictionResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (transactions) {
            setIsLoading(true);
            calculatePredictions(transactions, 6).then(res => {
                setPredictions(res);
                setIsLoading(false);
            });
        }
    }, [transactions]);

    if (isLoading || !predictions) {
        return (
            <MainLayout>
                <div className="container min-h-[80vh] flex flex-col items-center justify-center text-center gap-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                        className="rounded-full bg-primary/20 p-6 relative"
                    >
                        <BrainCircuit className="h-12 w-12 text-primary" />
                        <span className="absolute top-0 right-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    </motion.div>
                    <div>
                        <h2 className="font-display text-2xl font-bold text-foreground">Analyzing Patterns</h2>
                        <p className="mt-2 text-muted-foreground max-w-sm">
                            Our AI is training a TensorFlow model on your device to predict future financial trends...
                        </p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const { hasData } = predictions;
    const hasEnoughForTrend = predictions.income.filter(p => p.type === 'historical').length >= 2;

    const formatYAxis = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumSignificantDigits: 3,
            notation: "compact",
        }).format(value);
    };

    // Combine Historical and Prediction into single series mapping
    // We want the last historical month to also serve as the FIRST prediction month
    // to "connect" the lines visually.
    const lastHistoryIndex = predictions.income.findIndex((p, i, arr) => 
        p.type === 'historical' && (i === arr.length - 1 || arr[i+1].type === 'prediction')
    );

    const combinedData = predictions.income.map((inc, i) => {
        const exp = predictions.expenses[i];
        
        // If this is the last historical point, it connects the two lines
        const isConnectingPoint = (i === lastHistoryIndex);
        
        return {
            name: inc.month,
            date: inc.date,
            isPrediction: inc.type === 'prediction',
            
            IncomeHistory: inc.type === 'historical' ? inc.actual : null,
            IncomePrediction: (inc.type === 'prediction' || isConnectingPoint) ? (inc.actual || inc.predicted) : null,
            
            ExpensesHistory: exp.type === 'historical' ? exp.actual : null,
            ExpensesPrediction: (exp.type === 'prediction' || isConnectingPoint) ? (exp.actual || exp.predicted) : null,
        };
    });

    const nextMonthPrediction = predictions.savings.find(p => p.type === 'prediction');

    if (!hasData) {
        return (
            <MainLayout>
                <div className="container py-16 flex flex-col items-center justify-center text-center gap-6 min-h-[80vh]">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-full bg-muted/50 p-6 border border-border"
                    >
                        <Sparkles className="h-12 w-12 text-muted-foreground" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="font-display text-3xl font-bold text-foreground">No data to predict yet</h2>
                        <p className="mt-3 text-muted-foreground max-w-md mx-auto text-lg">
                            Add at least one income and one expense transaction to unleash the power of AI forecasting.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link to="/income">
                            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5">
                                <PlusCircle className="h-5 w-5" />
                                Add Transactions
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container py-8 max-w-7xl">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        Financial Forecast <Sparkles className="h-8 w-8 text-primary" />
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
                        AI-powered projections based on your historical spending habits, rendered natively on your device.
                    </p>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-10">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-background/50 ring-1 ring-border/50">
                            <div className="absolute right-0 top-0 p-4 opacity-10">
                                <Wallet className="h-24 w-24" />
                            </div>
                            <CardHeader className="space-y-1 pb-4">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Next Month Savings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-4xl font-black tracking-tighter ${nextMonthPrediction && nextMonthPrediction.predicted >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                                    {nextMonthPrediction ? formatCurrency(nextMonthPrediction.predicted) : '$0.00'}
                                </div>
                                <p className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-1.5">
                                    <AlertCircle className="h-4 w-4" />
                                    Estimated for {nextMonthPrediction?.month}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-background/50 ring-1 ring-border/50">
                            <div className="absolute right-0 top-0 p-4 opacity-10">
                                <TrendingUp className="h-24 w-24" />
                            </div>
                            <CardHeader className="space-y-1 pb-4">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Predicted Income</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black tracking-tighter text-emerald-500">
                                    {nextMonthPrediction ? formatCurrency(predictions.income.find(p => p.type === 'prediction')?.predicted || 0) : '$0.00'}
                                </div>
                                <p className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-1.5">
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    Expected inflow
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-background/50 ring-1 ring-border/50">
                            <div className="absolute right-0 top-0 p-4 opacity-10">
                                <TrendingDown className="h-24 w-24" />
                            </div>
                            <CardHeader className="space-y-1 pb-4">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Predicted Expenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black tracking-tighter text-rose-500">
                                    {nextMonthPrediction ? formatCurrency(predictions.expenses.find(p => p.type === 'prediction')?.predicted || 0) : '$0.00'}
                                </div>
                                <p className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-1.5">
                                    <TrendingDown className="h-4 w-4 text-rose-500" />
                                    Expected outflow
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Main Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="border-0 shadow-xl ring-1 ring-border/50 overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                            <CardTitle className="text-xl">6-Month AI Flow Analysis</CardTitle>
                            <CardDescription className="text-base">
                                Solid lines represent historical data. Dashed lines indicate AI predictions generated via Edge ML.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-8">
                            <div className="h-[450px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                                            dy={10}
                                        />
                                        <YAxis 
                                            tickFormatter={formatYAxis} 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                            dx={-10}
                                        />
                                        
                                        <Tooltip
                                            formatter={(value: number) => [formatCurrency(value), ""]}
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                borderRadius: '12px',
                                                border: '1px solid hsl(var(--border))',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                padding: '12px',
                                            }}
                                            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', marginBottom: '4px' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

                                        {/* Historical Areas */}
                                        <Area
                                            name="Historical Income"
                                            type="monotone"
                                            dataKey="IncomeHistory"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fill="url(#colorIncome)"
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                                        />
                                        <Area
                                            name="Historical Expenses"
                                            type="monotone"
                                            dataKey="ExpensesHistory"
                                            stroke="#ef4444"
                                            strokeWidth={3}
                                            fill="url(#colorExpense)"
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
                                        />

                                        {/* Prediction Areas */}
                                        <Area
                                            name="Predicted Income"
                                            type="monotone"
                                            dataKey="IncomePrediction"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            strokeDasharray="8 6"
                                            fill="url(#colorIncome)"
                                            fillOpacity={0.5}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                                        />
                                        <Area
                                            name="Predicted Expenses"
                                            type="monotone"
                                            dataKey="ExpensesPrediction"
                                            stroke="#ef4444"
                                            strokeWidth={3}
                                            strokeDasharray="8 6"
                                            fill="url(#colorExpense)"
                                            fillOpacity={0.5}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Disclaimer */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.6 }}
                    className="mt-8 bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl text-sm flex items-start gap-4 shadow-sm"
                >
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                        <BrainCircuit className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="font-bold text-foreground mb-1 text-base">How Edge AI works</p>
                        <p className="text-muted-foreground leading-relaxed">
                            {hasEnoughForTrend
                                ? 'Your device just trained a Sequential Neural Network via TensorFlow.js on your historical data. We prioritize your privacy: no financial data was sent to the cloud. The more months of data you add, the more accurate the forecast becomes.'
                                : 'Only one month of data is available. Our Neural Network needs more data to identify trends, so we are currently plotting a flat projection. Add more months for true AI forecasting.'}
                        </p>
                    </div>
                </motion.div>
            </div>
        </MainLayout>
    );
}
