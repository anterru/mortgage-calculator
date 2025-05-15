"use client"

import { useState, useEffect } from "react"
import { Calculator, Home, LineChart, PiggyBank, BarChart3, Plus, Building, Trash2 } from "lucide-react"
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

// Define the Bank Offer type
interface BankOffer {
  id: string
  name: string
  mortgageAmount: number
  years: number
  interestRate: number
}

export default function RealEstateCalculator() {
  // Purchase price state
  const [apartmentPrice, setApartmentPrice] = useState(300000)
  const [taxRate, setTaxRate] = useState(10)
  const [remodeling, setRemodeling] = useState(15000)
  const [contributionPercent, setContributionPercent] = useState(20)
  const [contributionAmount, setContributionAmount] = useState(0)

  // Mortgage state
  const [mortgageAmount, setMortgageAmount] = useState(0)
  const [mortgageYears, setMortgageYears] = useState(30)
  const [interestRate, setInterestRate] = useState(3.5)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalMortgage, setTotalMortgage] = useState(0)

  // Bank offers state
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([])
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)
  const [isAddingBank, setIsAddingBank] = useState(false)

  // New bank form state
  const [newBankName, setNewBankName] = useState("")
  const [newBankMortgageAmount, setNewBankMortgageAmount] = useState("")
  const [newBankYears, setNewBankYears] = useState("")
  const [newBankInterestRate, setNewBankInterestRate] = useState("")

  // Rental state
  const [monthlyRent, setMonthlyRent] = useState(1200)
  const [maintenanceExpenses, setMaintenanceExpenses] = useState(100)
  const [annualRent, setAnnualRent] = useState(0)
  const [annualMaintenance, setAnnualMaintenance] = useState(0)
  const [profitability, setProfitability] = useState(0)

  // Tax state
  const [irpfRate, setIrpfRate] = useState(19)
  const [irpfAmount, setIrpfAmount] = useState(0)
  const [cashflow, setCashflow] = useState(0)
  const [monthlyCashflow, setMonthlyCashflow] = useState(0)

  // Calculate total investment and mortgage needed
  useEffect(() => {
    const taxes = apartmentPrice * (taxRate / 100)
    const totalInvestment = apartmentPrice + taxes + remodeling
    const contribution = totalInvestment * (contributionPercent / 100)
    const mortgage = totalInvestment - contribution

    setContributionAmount(contribution)

    // Only update mortgage amount if no bank is selected
    if (!selectedBankId) {
      setMortgageAmount(mortgage)
    }
  }, [apartmentPrice, taxRate, remodeling, contributionPercent, selectedBankId])

  // Calculate mortgage details
  useEffect(() => {
    if (mortgageAmount > 0 && mortgageYears > 0 && interestRate > 0) {
      const monthlyRate = interestRate / 100 / 12
      const numberOfPayments = mortgageYears * 12

      // Monthly payment formula: P * (r(1+r)^n) / ((1+r)^n - 1)
      const monthly =
        (mortgageAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

      const total = monthly * numberOfPayments
      const interest = total - mortgageAmount

      setMonthlyPayment(monthly)
      setTotalInterest(interest)
      setTotalMortgage(total)
    }
  }, [mortgageAmount, mortgageYears, interestRate])

  // Calculate rental income and profitability
  useEffect(() => {
    const annual = monthlyRent * 12
    const annualMaint = maintenanceExpenses * 12
    const totalInvestment = apartmentPrice + apartmentPrice * (taxRate / 100) + remodeling
    const profit = ((annual - annualMaint) / totalInvestment) * 100

    setAnnualRent(annual)
    setAnnualMaintenance(annualMaint)
    setProfitability(profit)
  }, [monthlyRent, maintenanceExpenses, apartmentPrice, taxRate, remodeling])

  // Calculate tax implications
  useEffect(() => {
    const taxableIncome = (annualRent - annualMaintenance) * 0.6 // Assuming 40% deductible expenses
    const irpf = taxableIncome * (irpfRate / 100)
    const netRent = annualRent - annualMaintenance - irpf
    const cf = netRent - monthlyPayment * 12

    setIrpfAmount(irpf)
    setCashflow(cf)
    setMonthlyCashflow(cf / 12)
  }, [annualRent, annualMaintenance, irpfRate, monthlyPayment])

  // Handle bank selection
  useEffect(() => {
    if (selectedBankId) {
      const selectedBank = bankOffers.find((bank) => bank.id === selectedBankId)
      if (selectedBank) {
        setMortgageAmount(selectedBank.mortgageAmount)
        setMortgageYears(selectedBank.years)
        setInterestRate(selectedBank.interestRate)
      }
    }
  }, [selectedBankId, bankOffers])

  // Add a new bank offer
  const handleAddBank = () => {
    if (newBankName && newBankMortgageAmount && newBankYears && newBankInterestRate) {
      const newBank: BankOffer = {
        id: Date.now().toString(),
        name: newBankName,
        mortgageAmount: Number(newBankMortgageAmount),
        years: Number(newBankYears),
        interestRate: Number(newBankInterestRate),
      }

      setBankOffers([...bankOffers, newBank])

      // Reset form
      setNewBankName("")
      setNewBankMortgageAmount("")
      setNewBankYears("")
      setNewBankInterestRate("")
      setIsAddingBank(false)
    }
  }

  // Remove a bank offer
  const handleRemoveBank = (id: string) => {
    setBankOffers(bankOffers.filter((bank) => bank.id !== id))
    if (selectedBankId === id) {
      setSelectedBankId(null)

      // Reset to calculated mortgage amount
      const taxes = apartmentPrice * (taxRate / 100)
      const totalInvestment = apartmentPrice + taxes + remodeling
      const contribution = totalInvestment * (contributionPercent / 100)
      const mortgage = totalInvestment - contribution

      setMortgageAmount(mortgage)
      setMortgageYears(30) // Default
      setInterestRate(3.5) // Default
    }
  }

  // Reset to calculated mortgage
  const handleResetToCalculated = () => {
    setSelectedBankId(null)

    // Reset to calculated mortgage amount
    const taxes = apartmentPrice * (taxRate / 100)
    const totalInvestment = apartmentPrice + taxes + remodeling
    const contribution = totalInvestment * (contributionPercent / 100)
    const mortgage = totalInvestment - contribution

    setMortgageAmount(mortgage)
    setMortgageYears(30) // Default
    setInterestRate(3.5) // Default
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
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

  // Calculate total investment
  const totalInvestment = apartmentPrice + apartmentPrice * (taxRate / 100) + remodeling

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Real Estate Investment Calculator</h1>
        <p className="text-muted-foreground">
          Calculate the financial aspects of buying, mortgaging, and renting an apartment.
        </p>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="apartment-price">Apartment Price</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="apartment-price"
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
                            type="number"
                            value={remodeling}
                            onChange={(e) => setRemodeling(Number(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground w-24">{formatCurrency(remodeling)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contribution">Your Contribution (%)</Label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <Slider
                              id="contribution"
                              min={0}
                              max={100}
                              step={1}
                              value={[contributionPercent]}
                              onValueChange={(value) => setContributionPercent(value[0])}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">{contributionPercent}%</span>
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
                            Your Contribution ({contributionPercent}%):
                          </div>
                          <div className="text-sm font-medium text-right">{formatCurrency(contributionAmount)}</div>

                          <div className="text-sm text-muted-foreground">Mortgage Needed:</div>
                          <div className="text-sm font-medium text-right">
                            {formatCurrency(totalInvestment - contributionAmount)}
                          </div>

                          <div className="text-sm text-muted-foreground">Mortgage Percentage:</div>
                          <div className="text-sm font-medium text-right">
                            {formatPercent(((totalInvestment - contributionAmount) / apartmentPrice) * 100)}
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
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Mortgage Calculator</CardTitle>
                        <CardDescription>Calculate your mortgage payments and total costs</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setIsAddingBank(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Add Bank Offer
                      </Button>

                      <Dialog open={isAddingBank} onOpenChange={setIsAddingBank}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Bank Mortgage Offer</DialogTitle>
                            <DialogDescription>Enter the details of the mortgage offer from a bank.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="bank-name" className="text-right">
                                Bank Name
                              </Label>
                              <Input
                                id="bank-name"
                                value={newBankName}
                                onChange={(e) => setNewBankName(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="mortgage-amount" className="text-right">
                                Mortgage Amount
                              </Label>
                              <Input
                                id="mortgage-amount"
                                type="number"
                                value={newBankMortgageAmount}
                                onChange={(e) => setNewBankMortgageAmount(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="years" className="text-right">
                                Years
                              </Label>
                              <Input
                                id="years"
                                type="number"
                                value={newBankYears}
                                onChange={(e) => setNewBankYears(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="interest-rate" className="text-right">
                                Interest Rate (%)
                              </Label>
                              <Input
                                id="interest-rate"
                                type="number"
                                step="0.1"
                                value={newBankInterestRate}
                                onChange={(e) => setNewBankInterestRate(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddingBank(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddBank}>Add Bank</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Bank Offers Section */}
                    {bankOffers.length > 0 && (
                      <div className="mb-4">
                        <Label className="mb-2 block">Select Bank Offer</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={selectedBankId === null ? "default" : "outline"}
                            size="sm"
                            onClick={handleResetToCalculated}
                          >
                            Calculated
                          </Button>
                          {bankOffers.map((bank) => (
                            <div key={bank.id} className="flex items-center gap-1">
                              <Button
                                variant={selectedBankId === bank.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedBankId(bank.id)}
                              >
                                <Building className="h-3 w-3 mr-1" />
                                {bank.name}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleRemoveBank(bank.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="mortgage-amount">Mortgage Amount</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="mortgage-amount"
                            type="number"
                            value={mortgageAmount.toFixed(0)}
                            onChange={(e) => setMortgageAmount(Number(e.target.value))}
                            disabled={selectedBankId !== null}
                          />
                          <span className="text-sm text-muted-foreground w-24">{formatCurrency(mortgageAmount)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mortgage-years">Years to Pay Back</Label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <Slider
                              id="mortgage-years"
                              min={5}
                              max={40}
                              step={1}
                              value={[mortgageYears]}
                              onValueChange={(value) => setMortgageYears(value[0])}
                              disabled={selectedBankId !== null}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">{mortgageYears} yrs</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <Slider
                              id="interest-rate"
                              min={0.5}
                              max={10}
                              step={0.1}
                              value={[interestRate]}
                              onValueChange={(value) => setInterestRate(value[0])}
                              disabled={selectedBankId !== null}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">{interestRate}%</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                    <Accordion type="single" collapsible>
                      <AccordionItem value="amortization">
                        <AccordionTrigger>Amortization Schedule</AccordionTrigger>
                        <AccordionContent>
                          <div className="text-sm text-muted-foreground">
                            The amortization schedule would show a detailed breakdown of each payment, including
                            principal and interest portions. This would be a large table and could be implemented as a
                            separate component.
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>

              {/* Rental Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <LineChart className="mr-2 h-5 w-5" />
                  <h2 className="text-xl font-semibold">Rental Income</h2>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Rental Income Calculator</CardTitle>
                    <CardDescription>Calculate potential rental income and profitability</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="monthly-rent">Monthly Rent</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="monthly-rent"
                            type="number"
                            value={monthlyRent}
                            onChange={(e) => setMonthlyRent(Number(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground w-24">{formatCurrency(monthlyRent)}</span>
                        </div>
                      </div>

                      {/* Maintenance expenses field */}
                      <div className="space-y-2">
                        <Label htmlFor="maintenance-expenses">Monthly Maintenance Expenses</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="maintenance-expenses"
                            type="number"
                            value={maintenanceExpenses}
                            onChange={(e) => setMaintenanceExpenses(Number(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground w-24">
                            {formatCurrency(maintenanceExpenses)}
                          </span>
                        </div>
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
                            Maintenance: {formatCurrency(annualMaintenance)}
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
                          <p className="text-sm text-muted-foreground">
                            (Annual rent - Maintenance) / Total investment
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Monthly Cashflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div
                            className={`text-2xl font-bold ${(monthlyRent - maintenanceExpenses - monthlyPayment) >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(monthlyRent - maintenanceExpenses - monthlyPayment)}
                          </div>
                          <p className="text-sm text-muted-foreground">Rent - Maintenance - Mortgage (before taxes)</p>
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
                  <h2 className="text-xl font-semibold">Tax Implications</h2>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Tax Implications</CardTitle>
                    <CardDescription>Calculate tax implications and cashflow</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="irpf-rate">IRPF Tax Rate (%)</Label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <Slider
                              id="irpf-rate"
                              min={0}
                              max={50}
                              step={1}
                              value={[irpfRate]}
                              onValueChange={(value) => setIrpfRate(value[0])}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">{irpfRate}%</span>
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

                          <div className="text-sm text-muted-foreground">Taxable Income (60%):</div>
                          <div className="text-sm font-medium text-right">
                            {formatCurrency((annualRent - annualMaintenance) * 0.6)}
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
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      Note: This is a simplified tax calculation. Consult with a tax professional for accurate advice.
                    </p>
                  </CardFooter>
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
                      {selectedBankId && (
                        <Badge variant="outline" className="mt-1">
                          {bankOffers.find((b) => b.id === selectedBankId)?.name}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Monthly Rent</h3>
                      <p className="text-2xl font-bold">{formatCurrency(monthlyRent)}</p>
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

              {/* Investment and Mortgage Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Investment Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Breakdown</CardTitle>
                    <CardDescription>How your investment is distributed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-y-3">
                      <div className="text-sm">Apartment Price:</div>
                      <div className="text-sm font-medium text-right">{formatCurrency(apartmentPrice)}</div>

                      <div className="text-sm">Taxes ({taxRate}%):</div>
                      <div className="text-sm font-medium text-right">
                        {formatCurrency(apartmentPrice * (taxRate / 100))}
                      </div>

                      <div className="text-sm">Remodeling:</div>
                      <div className="text-sm font-medium text-right">{formatCurrency(remodeling)}</div>

                      <Separator className="col-span-2 my-1" />

                      <div className="text-sm font-medium">Total Investment:</div>
                      <div className="text-sm font-bold text-right">{formatCurrency(totalInvestment)}</div>

                      <Separator className="col-span-2 my-1" />

                      <div className="text-sm">Your Contribution ({contributionPercent}%):</div>
                      <div className="text-sm font-medium text-right">{formatCurrency(contributionAmount)}</div>

                      <div className="text-sm">Mortgage Needed:</div>
                      <div className="text-sm font-medium text-right">{formatCurrency(mortgageAmount)}</div>

                      <div className="text-sm">Mortgage Percentage:</div>
                      <div className="text-sm font-medium text-right">
                        {formatPercent((mortgageAmount / apartmentPrice) * 100)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mortgage Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mortgage Analysis</CardTitle>
                    <CardDescription>
                      Principal vs Interest over {mortgageYears} years
                      {selectedBankId && (
                        <Badge variant="outline" className="ml-2">
                          {bankOffers.find((b) => b.id === selectedBankId)?.name}
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-y-3">
                      <div className="text-sm">Principal Amount:</div>
                      <div className="text-sm font-medium text-right">{formatCurrency(mortgageAmount)}</div>

                      <div className="text-sm">Total Interest:</div>
                      <div className="text-sm font-medium text-right">{formatCurrency(totalInterest)}</div>

                      <div className="text-sm font-medium">Total Mortgage Cost:</div>
                      <div className="text-sm font-bold text-right">{formatCurrency(totalMortgage)}</div>

                      <Separator className="col-span-2 my-2" />

                      <div className="text-sm">Interest Rate:</div>
                      <div className="text-sm font-medium text-right">{interestRate}%</div>

                      <div className="text-sm">Loan Term:</div>
                      <div className="text-sm font-medium text-right">{mortgageYears} years</div>

                      <div className="text-sm">Monthly Payment:</div>
                      <div className="text-sm font-medium text-right">{formatCurrency(monthlyPayment)}</div>

                      <div className="text-sm">Interest to Principal Ratio:</div>
                      <div className="text-sm font-medium text-right">
                        {formatPercent(totalInterest / mortgageAmount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

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

                      <div className="text-sm">Monthly Maintenance:</div>
                      <div className="text-sm font-medium text-right">-{formatCurrency(maintenanceExpenses)}</div>

                      <div className="text-sm">Monthly Tax (IRPF):</div>
                      <div className="text-sm font-medium text-right">-{formatCurrency(irpfAmount / 12)}</div>

                      <Separator className="col-span-2 my-1" />

                      <div className="text-sm font-medium">Net Monthly Income:</div>
                      <div className="text-sm font-bold text-right">
                        {formatCurrency(monthlyRent - maintenanceExpenses - irpfAmount / 12)}
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
                      <div className="text-sm">Net Monthly Rental Income:</div>
                      <div className="text-sm font-medium text-right">
                        {formatCurrency(monthlyRent - maintenanceExpenses - irpfAmount / 12)}
                      </div>

                      <div className="text-sm">Monthly Mortgage Payment:</div>
                      <div className="text-sm font-medium text-right">-{formatCurrency(monthlyPayment)}</div>

                      <Separator className="col-span-2 my-1" />

                      <div className="text-sm font-medium">Monthly Cashflow:</div>
                      <div
                        className={`text-sm font-bold text-right ${monthlyCashflow >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(monthlyCashflow)}
                      </div>

                      <Separator className="col-span-2 my-1" />

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
