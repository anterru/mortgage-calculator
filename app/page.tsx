"use client"

import { useState, useEffect, useRef } from "react"
import { Calculator, Home, LineChart, PiggyBank, BarChart3, Plus, Building, Trash2, Download, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function RealEstateCalculator() {
  // Reference for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Purchase price state
  const [apartmentPrice, setApartmentPrice] = useState(200000)
  const [taxRate, setTaxRate] = useState(10)
  const [remodeling, setRemodeling] = useState(2000)
  const [contributionPercent, setContributionPercent] = useState(10)
  const [contributionAmount, setContributionAmount] = useState(0)

  // Mortgage state
  const [mortgageYears, setMortgageYears] = useState(30)
  const [interestRate, setInterestRate] = useState(1.9)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalMortgage, setTotalMortgage] = useState(0)

  // Rental state
  const [monthlyRent, setMonthlyRent] = useState(1200)
  const [expenses, setExpenses] = useState<Array<{ id: string; name: string; amount: number }>>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [annualRent, setAnnualRent] = useState(0)
  const [annualMaintenance, setAnnualMaintenance] = useState(0)
  const [profitability, setProfitability] = useState(0)

  // Tax state
  const [irpfRate, setIrpfRate] = useState(32)
  const [irpfAmount, setIrpfAmount] = useState(0)
  const [cashflow, setCashflow] = useState(0)
  const [monthlyCashflow, setMonthlyCashflow] = useState(0)
  const [includeAdditionalCosts, setIncludeAdditionalCosts] = useState(false)
  const [totalContribution, setTotalContribution] = useState(0)

  // Total investment
  const totalInvestment = apartmentPrice + apartmentPrice * (taxRate / 100) + remodeling
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpenses = totalExpenses / 12;
  const additionalCosts = apartmentPrice * (taxRate / 100) + remodeling

  // Update total contribution when relevant values change
  useEffect(() => {
    setTotalContribution(contributionAmount + (includeAdditionalCosts ? additionalCosts : 0));
  }, [contributionAmount, includeAdditionalCosts, additionalCosts]);

  const handleContributionAmountChange = (amount: number) => {
    const newPercentage = (amount / totalInvestment) * 100;
    const clampedPercentage = Math.min(Math.max(0, newPercentage), 100);
    setContributionPercent(clampedPercentage);
  };
  
  const handleContributionPercentChange = (percentage: number) => {
    setContributionPercent(percentage);
  };

  // Handle include additional costs change
  const handleIncludeAdditionalCostsChange = (checked: boolean) => {
    setIncludeAdditionalCosts(checked);
  };

  // Calculate total investment and mortgage needed
  useEffect(() => {
    const taxes = apartmentPrice * (taxRate / 100)
    const totalInvestment = apartmentPrice + taxes + remodeling
    const contribution = apartmentPrice * (contributionPercent / 100)
    const mortgage = totalInvestment - contribution

    setContributionAmount(contribution)
  }, [apartmentPrice, taxRate, remodeling, contributionPercent])

  // Calculate mortgage details
  useEffect(() => {
    const mortgage = totalInvestment - totalContribution;
    if (mortgage > 0 && mortgageYears > 0 && interestRate > 0) {
      const monthlyRate = interestRate / 100 / 12
      const numberOfPayments = mortgageYears * 12

      // Monthly payment formula: P * (r(1+r)^n) / ((1+r)^n - 1)
      const monthly =
        (mortgage * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

      const interest = monthly * numberOfPayments - mortgage
      const total = totalInvestment + interest

      setMonthlyPayment(monthly)
      setTotalInterest(interest)
      setTotalMortgage(total)
    }
  }, [totalInvestment, contributionAmount, mortgageYears, interestRate, totalContribution])

  // Calculate rental income and profitability
  useEffect(() => {
    const annual = monthlyRent * 12
    const annualExpenses = totalExpenses // Now directly using annual expenses
    const totalInvestment = apartmentPrice + apartmentPrice * (taxRate / 100) + remodeling
    const profit = ((annual - annualExpenses) / totalInvestment) * 100

    setAnnualRent(annual)
    setAnnualMaintenance(annualExpenses)
    setProfitability(profit)
  }, [monthlyRent, totalExpenses, apartmentPrice, taxRate, remodeling, includeAdditionalCosts])

  // Calculate tax implications
  useEffect(() => {
    const taxableIncome = (annualRent - annualMaintenance) * 0.4 // Assuming 60% deductible expenses
    const irpf = taxableIncome * (irpfRate / 100)
    const netRent = annualRent - annualMaintenance - irpf
    const cf = netRent - monthlyPayment * 12

    setIrpfAmount(irpf)
    setCashflow(cf)
    setMonthlyCashflow(cf / 12)
  }, [annualRent, annualMaintenance, irpfRate, monthlyPayment, includeAdditionalCosts])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
      useGrouping: true
    }).format(value)
  }

  // Format percentage
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  // Export state to CSV
  const exportToCSV = () => {
    // Define the key state values to export
    const stateToExport = {
      // Purchase details
      apartmentPrice,
      taxRate,
      remodeling,
      contributionPercent,
      
      // Mortgage details
      mortgageYears,
      interestRate,
      
      // Rental details
      monthlyRent,
      
      // Expenses (as JSON string)
      expenses: JSON.stringify(expenses).replace(/,/g, ';'),
      
      // Tax details
      irpfRate,
      includeAdditionalCosts
    };
    
    // Convert to CSV format with proper escaping
    const csvHeader = Object.keys(stateToExport).join(',');
    const csvValues = Object.values(stateToExport).map(value => {
      // Wrap strings in quotes and escape any existing quotes
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
    
    const csvContent = `${csvHeader}\n${csvValues}`;
    
    // Create a blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Use the showSaveFilePicker API if available (modern browsers)
    if ('showSaveFilePicker' in window) {
      const saveFile = async () => {
        try {
          // Show the file picker
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: `real-estate-calculator-${new Date().toISOString().slice(0,10)}.csv`,
            types: [{
              description: 'CSV File',
              accept: { 'text/csv': ['.csv'] },
            }],
          });
          
          // Create a writable stream
          const writable = await handle.createWritable();
          
          // Write the blob to the file
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          // User might have canceled the save dialog
          console.log('Save canceled or error occurred:', err);
        }
      };
      
      saveFile();
    } else {
      // Fallback for browsers that don't support showSaveFilePicker
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `real-estate-calculator-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Import state from CSV
  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        
        if (lines.length < 2) throw new Error('Invalid CSV format');
        
        // Parse CSV properly, handling quoted values
        const parseCSVLine = (line: string) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                // Handle escaped quotes
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current);
          return result;
        };
        
        const headers = parseCSVLine(lines[0]);
        const values = parseCSVLine(lines[1]);
        
        // Create an object from headers and values
        const importedState: Record<string, any> = {};
        headers.forEach((header, index) => {
          const value = values[index];
          // Handle special cases for JSON strings
          if (header === 'expenses') {
            try {
              // Replace semicolons back to commas before parsing JSON
              importedState[header] = JSON.parse(value.replace(/;/g, ','));
            } catch (err) {
              console.error(`Error parsing ${header}:`, err);
              importedState[header] = [];
            }
          } else {
            importedState[header] = value;
          }
        });
        
        // Update state variables with imported values
        if ('apartmentPrice' in importedState) setApartmentPrice(Number(importedState.apartmentPrice));
        if ('taxRate' in importedState) setTaxRate(Number(importedState.taxRate));
        if ('remodeling' in importedState) setRemodeling(Number(importedState.remodeling));
        if ('contributionPercent' in importedState) setContributionPercent(Number(importedState.contributionPercent));
        if ('mortgageYears' in importedState) setMortgageYears(Number(importedState.mortgageYears));
        if ('interestRate' in importedState) setInterestRate(Number(importedState.interestRate));
        if ('monthlyRent' in importedState) setMonthlyRent(Number(importedState.monthlyRent));
        if ('expenses' in importedState) setExpenses(importedState.expenses);
        if ('irpfRate' in importedState) setIrpfRate(Number(importedState.irpfRate));
        if ('includeAdditionalCosts' in importedState) setIncludeAdditionalCosts(importedState.includeAdditionalCosts);
        // Clear the file input
        if (fileInputRef.current) fileInputRef.current.value = '';
        
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please make sure the file is in the correct format.');
      }
    };
    
    reader.readAsText(file);
  };

  // Trigger file input click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Add new expense
  const handleAddExpense = () => {
    if (newExpenseName && newExpenseAmount) {
      const newExpense = {
        id: Date.now().toString(),
        name: newExpenseName,
        amount: Number(newExpenseAmount)
      };
      setExpenses([...expenses, newExpense]);
      setNewExpenseName('');
      setNewExpenseAmount('');
      setIsAddingExpense(false);
    }
  };

  // Remove expense
  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Update expense amount
  const handleUpdateExpense = (id: string, amount: number) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, amount } : expense
    ));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Real Estate Investment Calculator</h1>
            <p className="text-muted-foreground">
              Calculate the financial aspects of buying, mortgaging, and renting an apartment.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportClick}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={importFromCSV}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="calculator">
              <Calculator className="mr-2 h-4 w-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Purchase Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <Home className="mr-2 h-5 w-5" />
                  <h2 className="text-xl font-semibold">Purchase Details</h2>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Purchase Details</CardTitle>
                    <CardDescription>Enter the details of the apartment purchase</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="apartment-price">Apartment Price</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="apartment-price"
                            step={2500}
                            type="number"
                            value={apartmentPrice}
                            onChange={(e) => setApartmentPrice(Number(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground w-24">{formatCurrency(apartmentPrice)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="tax-rate"
                            type="number"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground w-24">
                            {formatCurrency(apartmentPrice * (taxRate / 100))}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="remodeling">Additional Costs</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="remodeling"
                            step={100}
                            type="number"
                            value={remodeling}
                            onChange={(e) => setRemodeling(Number(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground w-24">{formatCurrency(remodeling)}</span>
                        </div>
                      </div>

                     
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2">Total Investment</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-muted-foreground">Apartment Price:</div>
                          <div className="text-sm font-medium text-right">{formatCurrency(apartmentPrice)}</div>

                          <div className="text-sm text-muted-foreground">Taxes ({taxRate}%):</div>
                          <div className="text-sm font-medium text-right">
                            {formatCurrency(apartmentPrice * (taxRate / 100))}
                          </div>

                          <div className="text-sm text-muted-foreground">Remodeling:</div>
                          <div className="text-sm font-medium text-right">{formatCurrency(remodeling)}</div>

                          <Separator className="col-span-2 my-1" />

                          <div className="text-sm font-medium">Total:</div>
                          <div className="text-sm font-bold text-right">{formatCurrency(totalInvestment)}</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Financing</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-muted-foreground">
                            Your Contribution
                          </div>
                          <div className="text-sm font-medium text-right">{formatCurrency(contributionAmount)}</div>

                          <div className="text-sm text-muted-foreground">Mortgage Needed (€):</div>
                          <div className="text-sm font-medium text-right">
                            {formatCurrency(totalInvestment - totalContribution)}
                          </div>

                          <div className="text-sm text-muted-foreground">Mortgage Percentage (based on apartment price):</div>
                          <div className="text-sm font-medium text-right">
                            {formatPercent(((totalInvestment - totalContribution) / apartmentPrice) * 100)}
                          </div>
                          <div className="text-sm text-muted-foreground">Mortgage Percentage (based on total investment):</div>
                          <div className="text-sm font-medium text-right">
                            {formatPercent((1 - (totalContribution / apartmentPrice)) * 100)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mortgage Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <PiggyBank className="mr-2 h-5 w-5" />
                  <h2 className="text-xl font-semibold">Mortgage Calculator</h2>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Mortgage Calculator</CardTitle>
                    <CardDescription>Calculate your mortgage payments and total costs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contribution" className="text-sm">Your Contribution</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {/* Percentage input */}
                        <div className="space-y-1">
                          <Label htmlFor="contributionPercent" className="text-xs">Percentage</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="contributionPercent"
                              type="number"
                              step={0.1}
                              min={0}
                              max={100}
                              className="text-sm"
                              value={contributionPercent.toFixed(2)}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 0 && value <= 100) {
                                  handleContributionPercentChange(value);
                                }
                              }}
                            />
                            <span className="text-sm font-medium">%</span>
                          </div>
                        </div>
                        
                        {/* Amount input */}
                        <div className="space-y-1">
                          <Label htmlFor="contributionAmount" className="text-xs">Amount</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="contributionAmount"
                              type="number"
                              step={2500}
                              min={0}
                              max={totalInvestment}
                              className="text-sm"
                              value={contributionAmount.toFixed(0)}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 0 && value <= totalInvestment) {
                                  handleContributionAmountChange(value);
                                }
                              }}
                            />
                            <span className="text-sm text-muted-foreground">€</span>
                          </div>
                        </div>
                        {/* Total Contribution row */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="totalContribution" className="text-xs">Total Contribution</Label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="includeAdditionalCosts"
                                checked={includeAdditionalCosts}
                                onChange={(e) => handleIncludeAdditionalCostsChange(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor="includeAdditionalCosts" className="text-xs text-muted-foreground">
                                Include additional costs
                              </Label>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="totalContribution"
                              type="number"
                              className="text-sm"
                              value={totalContribution.toFixed(0)}
                              disabled
                            />
                            <span className="text-sm text-muted-foreground">€</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="mortgage-amount">Mortgage Amount</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="mortgage-amount"
                            step={2500}
                            type="number"
                            value={totalInvestment - totalContribution}
                            disabled={true}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="mortgage-years">Years to Pay Back</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="mortgage-years"
                            type="number"
                            min={5}
                            max={40}
                            step={1}
                            value={mortgageYears}
                            onChange={(e) => {
                              const value = Math.round(Number(e.target.value));
                              if (!isNaN(value) && value >= 5 && value <= 40) {
                                setMortgageYears(value);
                              }
                            }}
                          />
                          <span className="text-sm font-medium w-12">{mortgageYears} yrs</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="interest-rate"
                            type="number"
                            min={0.5}
                            max={10}
                            step={0.1}
                            value={interestRate}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (value >= 0.5 && value <= 10) {
                                setInterestRate(value);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Monthly Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Total Interest</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(totalInterest)}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Total Mortgage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(totalMortgage)}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rental Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <LineChart className="mr-2 h-5 w-5" />
                  <h2 className="text-xl font-semibold">Gross Income</h2>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Rental Income Calculator</CardTitle>
                    <CardDescription>Before taxes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="monthly-rent">Monthly Rent</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="monthly-rent"
                            type="number"
                            step={50}
                            value={monthlyRent}
                            onChange={(e) => setMonthlyRent(Number(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground w-24">{formatCurrency(monthlyRent - monthlyExpenses - irpfAmount / 12)}</span>
                        </div>
                      </div>

                      {/* Replace maintenance expenses field with expenses management */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Annual Expenses</Label>
                          <Button variant="outline" size="sm" onClick={() => setIsAddingExpense(true)}>
                            <Plus className="h-4 w-4 mr-1" /> Add Expense
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {expenses.map((expense) => (
                            <div key={expense.id} className="flex items-center space-x-2">
                              <Input
                                type="text"
                                value={expense.name}
                                disabled
                                className="w-1/3"
                              />
                              <Input
                                type="number"
                                value={expense.amount}
                                onChange={(e) => handleUpdateExpense(expense.id, Number(e.target.value))}
                                className="w-1/3"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveExpense(expense.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Annual Expense</DialogTitle>
                              <DialogDescription>Enter the name and annual amount of the new expense.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="expense-name" className="text-right">
                                  Name
                                </Label>
                                <Input
                                  id="expense-name"
                                  value={newExpenseName}
                                  onChange={(e) => setNewExpenseName(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="expense-amount" className="text-right">
                                  Annual Amount
                                </Label>
                                <Input
                                  id="expense-amount"
                                  type="number"
                                  value={newExpenseAmount}
                                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddExpense}>Add Expense</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Annual Rent</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatCurrency(annualRent)}</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Expenses: {formatCurrency(annualMaintenance)}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            Net: {formatCurrency(annualRent - annualMaintenance)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Profitability</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{profitability.toFixed(2)}%</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Monthly Cashflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div
                            className={`text-2xl font-bold ${(monthlyRent - monthlyExpenses - monthlyPayment) >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(monthlyRent - monthlyExpenses - monthlyPayment)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tax Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  <h2 className="text-xl font-semibold">Actual Income</h2>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Tax Implications</CardTitle>
                    <CardDescription>Deduct taxes and calculate cashflow</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="irpf-rate">IRPF Tax Rate (%)</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="irpf-rate"
                            type="number"
                            min={0}
                            max={50}
                            step={1}
                            value={irpfRate}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (value >= 0 && value <= 50) {
                                setIrpfRate(value);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2">Annual Tax Calculation</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-muted-foreground">Annual Rental Income:</div>
                          <div className="text-sm font-medium text-right">{formatCurrency(annualRent)}</div>

                          <div className="text-sm text-muted-foreground">Annual Maintenance:</div>
                          <div className="text-sm font-medium text-right">{formatCurrency(annualMaintenance)}</div>

                          <div className="text-sm text-muted-foreground">Taxable Income (40%):</div>
                          <div className="text-sm font-medium text-right">
                            {formatCurrency((annualRent - annualMaintenance) * 0.4)}
                          </div>

                          <div className="text-sm text-muted-foreground">IRPF Tax ({irpfRate}%):</div>
                          <div className="text-sm font-medium text-right">{formatCurrency(irpfAmount)}</div>

                          <Separator className="col-span-2 my-1" />

                          <div className="text-sm font-medium">Net Rental Income:</div>
                          <div className="text-sm font-bold text-right">
                            {formatCurrency(annualRent - annualMaintenance - irpfAmount)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Annual Cashflow</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-muted-foreground">Net Rental Income:</div>
                          <div className="text-sm font-medium text-right">
                            {formatCurrency(annualRent - annualMaintenance - irpfAmount)}
                          </div>

                          <div className="text-sm text-muted-foreground">Annual Mortgage Payment:</div>
                          <div className="text-sm font-medium text-right">{formatCurrency(monthlyPayment * 12)}</div>

                          <Separator className="col-span-2 my-1" />

                          <div className="text-sm font-medium">Annual Cashflow:</div>
                          <div
                            className={`text-sm font-bold text-right ${cashflow >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(cashflow)}
                          </div>

                          <div className="text-sm text-muted-foreground">Monthly Cashflow:</div>
                          <div
                            className={`text-sm font-medium text-right ${monthlyCashflow >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(monthlyCashflow)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Key Metrics Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                  <CardDescription>Key metrics for your real estate investment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Total Investment</h3>
                      <p className="text-2xl font-bold">{formatCurrency(totalInvestment)}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Monthly Payment</h3>
                      <p className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Net monthly income</h3>
                      <p className="text-2xl font-bold">{formatCurrency(monthlyRent - monthlyExpenses - irpfAmount / 12)}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Monthly Cashflow</h3>
                      <p className={`text-2xl font-bold ${monthlyCashflow >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(monthlyCashflow)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental and Cashflow Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rental Income Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Rental Income Analysis</CardTitle>
                    <CardDescription>Monthly income and expenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-y-3">
                      <div className="text-sm">Monthly Rent:</div>
                      <div className="text-sm font-medium text-right">{formatCurrency(monthlyRent)}</div>

                      <div className="text-sm">Monthly Expenses:</div>
                      <div className="text-sm font-medium text-right">-{formatCurrency(monthlyExpenses)}</div>

                      <div className="text-sm">Monthly Tax (IRPF):</div>
                      <div className="text-sm font-medium text-right">-{formatCurrency(irpfAmount / 12)}</div>

                      <Separator className="col-span-2 my-1" />

                      <div className="text-sm font-medium">Net Monthly Income:</div>
                      <div className="text-sm font-bold text-right">
                        {formatCurrency(monthlyRent - monthlyExpenses - irpfAmount / 12)}
                      </div>

                      <Separator className="col-span-2 my-1" />

                      <div className="text-sm">Annual Gross Rent:</div>
                      <div className="text-sm font-medium text-right">{formatCurrency(annualRent)}</div>

                      <div className="text-sm">Annual Maintenance:</div>
                      <div className="text-sm font-medium text-right">-{formatCurrency(annualMaintenance)}</div>

                      <div className="text-sm">Annual Tax (IRPF):</div>
                      <div className="text-sm font-medium text-right">-{formatCurrency(irpfAmount)}</div>

                      <div className="text-sm font-medium">Net Annual Income:</div>
                      <div className="text-sm font-bold text-right">
                        {formatCurrency(annualRent - annualMaintenance - irpfAmount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cashflow Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cashflow Analysis</CardTitle>
                    <CardDescription>Monthly and annual cashflow breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-y-3">


                      <div className="text-sm">Net Annual Rental Income:</div>
                      <div className="text-sm font-medium text-right">
                        {formatCurrency(annualRent - annualMaintenance - irpfAmount)}
                      </div>

                      <div className="text-sm">Annual Mortgage Payments:</div>
                      <div className="text-sm font-medium text-right">-{formatCurrency(monthlyPayment * 12)}</div>

                      <div className="text-sm font-medium">Annual Cashflow:</div>
                      <div
                        className={`text-sm font-bold text-right ${cashflow >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(cashflow)}
                      </div>

                      <Separator className="col-span-2 my-1" />

                      <div className="text-sm">Return on Investment:</div>
                      <div className="text-sm font-medium text-right">{profitability.toFixed(2)}%</div>

                      <div className="text-sm">Cashflow to Investment Ratio:</div>
                      <div className="text-sm font-medium text-right">
                        {((cashflow / totalInvestment) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
