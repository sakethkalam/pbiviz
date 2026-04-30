# MBR Monthly Entry — Power BI Custom Visual

Free-text comment capture + full monthly metric form with direct Fabric UDF writeback.

---

## What this visual does

- Renders a complete MBR monthly data entry form inside a Power BI visual
- Captures **free text comments** — no character restrictions, no predefined list
- Reads slicer context (IDN, Bill To, Fiscal Year, Month) automatically from bound DAX measures
- POSTs directly to your Fabric User Data Function endpoint on submit
- Shows success/error feedback inline

---

## Setup steps

### 1. Install prerequisites

```bash
npm install -g powerbi-visuals-tools
```

### 2. Install dependencies

```bash
cd mbr-comment-visual
npm install
```

### 3. Build the visual

```bash
pbiviz package
```

This generates `dist/mbr-comment-visual.pbiviz`

### 4. Import into Power BI

In Power BI Desktop:
- Visualizations pane → "..." → Import a visual from a file
- Select `dist/mbr-comment-visual.pbiviz`

### 5. Add the visual to your report

Place the visual on your MBR report page.

### 6. Bind data roles

In the Fields pane, map these DAX measures to the visual's data roles:

| Data Role      | Bind this DAX measure              |
|----------------|------------------------------------|
| IDN            | `[_Selected IDN]`                  |
| Bill To        | `[_Selected Bill To]`              |
| Fiscal Year    | `[_Selected FiscalYear]`           |
| Month          | `[_Selected Month]`                |
| Submitted By   | `[_User UPN]`                      |

### 7. Configure the UDF endpoint

In the Format pane → UDF Endpoint Settings:

```
Fabric UDF Endpoint URL:
  https://api.fabric.microsoft.com/v1/workspaces/{your-workspace-id}
  /userDataFunctions/{your-function-id}/invoke/SubmitMonthlyMBR

Function Name: SubmitMonthlyMBR

Bearer Token: <your Fabric bearer token>
```

---

## How the comment capture works

The visual renders a real HTML `<textarea>` inside the Power BI visual iframe.
Unlike slicers (which only filter existing values), this textarea:

- Accepts any free text up to 1000 characters
- Shows a live character counter
- Validates the comment is not blank before submitting
- Sends the typed text directly in the UDF payload as the `comments` parameter

---

## UDF parameter mapping

The visual POSTs this JSON to your Fabric UDF:

```json
{
  "idn":                   "DUKE HEALTH",
  "billTo":                "",
  "fiscalYear":            "2026",
  "month":                 "April",
  "submittedBy":           "user@terumo.com",
  "annualizedConversions": "100000",
  "expectedPriceIncrease": "250000",
  "lostBusiness":          "-20000",
  "netSalesChange":        "330000",
  "expectedYr1Pct":        "0.08",
  "comments":              "8% increase with new commitment on packs — approved by regional manager"
}
```

---

## Auth note

The Bearer Token in the format pane is sensitive.
For production, route the call through a Power Automate HTTP trigger
(one step, no connectors) which handles auth server-side,
then point the visual endpoint URL at the Power Automate trigger URL instead.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "No account selected" chip shows | Bind IDN or BillTo data role |
| Submit button disabled | Ensure IDN/BillTo + Month + FiscalYear are all bound and have slicer selections |
| 401 error on submit | Check Bearer Token in format pane |
| 403 error | Ensure the visual is listed in capabilities.json privileges for WebAccess |
