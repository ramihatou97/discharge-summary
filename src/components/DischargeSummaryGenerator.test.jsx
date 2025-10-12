import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DischargeSummaryGenerator from './DischargeSummaryGenerator'

describe('DischargeSummaryGenerator Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('renders the main heading', () => {
    render(<DischargeSummaryGenerator />)
    expect(screen.getByText('Discharge Summary Generator')).toBeInTheDocument()
  })

  it('renders settings section', () => {
    render(<DischargeSummaryGenerator />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders clinical notes textarea', () => {
    render(<DischargeSummaryGenerator />)
    const textarea = screen.getByPlaceholderText(/Paste all clinical notes here/i)
    expect(textarea).toBeInTheDocument()
  })

  it('allows user to input clinical notes', async () => {
    const user = userEvent.setup()
    render(<DischargeSummaryGenerator />)

    const textarea = screen.getByPlaceholderText(/Paste all clinical notes here/i)
    await user.type(textarea, 'Test note content')

    expect(textarea).toHaveValue('Test note content')
  })

  it('shows character count', async () => {
    const user = userEvent.setup()
    render(<DischargeSummaryGenerator />)

    const textarea = screen.getByPlaceholderText(/Paste all clinical notes here/i)
    await user.type(textarea, 'Test')

    await waitFor(() => {
      expect(screen.getByText(/Character count: 4/i)).toBeInTheDocument()
    })
  })

  it('renders extract button', () => {
    render(<DischargeSummaryGenerator />)
    const extractButton = screen.getByRole('button', { name: /Auto-Detect & Extract Information/i })
    expect(extractButton).toBeInTheDocument()
  })

  it('extract button is disabled when textarea is empty', () => {
    render(<DischargeSummaryGenerator />)
    const extractButton = screen.getByRole('button', { name: /Auto-Detect & Extract Information/i })
    expect(extractButton).toBeDisabled()
  })

  it('extract button is enabled when textarea has content', async () => {
    const user = userEvent.setup()
    render(<DischargeSummaryGenerator />)

    const textarea = screen.getByPlaceholderText(/Paste all clinical notes here/i)
    const extractButton = screen.getByRole('button', { name: /Auto-Detect & Extract Information/i })

    await user.type(textarea, 'Patient: John Doe, Age: 45 years old')

    await waitFor(() => {
      expect(extractButton).not.toBeDisabled()
    })
  })

  it('toggles AI extraction setting', async () => {
    const user = userEvent.setup()
    render(<DischargeSummaryGenerator />)

    const checkbox = screen.getByRole('checkbox', { name: /Use Multi-AI Extraction/i })
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('shows auto-save indicator when enabled', () => {
    render(<DischargeSummaryGenerator />)
    expect(screen.getByText(/Auto-save input on/i)).toBeInTheDocument()
  })

  it('renders template selector', () => {
    render(<DischargeSummaryGenerator />)
    const select = screen.getByLabelText(/Template/i)
    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('standard')
  })

  it('changes template when option is selected', async () => {
    const user = userEvent.setup()
    render(<DischargeSummaryGenerator />)

    const select = screen.getByLabelText(/Template/i)
    await user.selectOptions(select, 'detailed')

    expect(select).toHaveValue('detailed')
  })

  it('renders trash button for clearing data', () => {
    render(<DischargeSummaryGenerator />)
    const trashButton = screen.getByTitle('Clear all data')
    expect(trashButton).toBeInTheDocument()
  })

  it('shows "Generated summary will appear here" initially', () => {
    render(<DischargeSummaryGenerator />)
    expect(screen.getByText('Generated summary will appear here')).toBeInTheDocument()
  })
})
