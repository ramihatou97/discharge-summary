import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders dark mode toggle button', () => {
    render(<App />)
    const toggleButton = screen.getByLabelText(/toggle dark mode/i)
    expect(toggleButton).toBeInTheDocument()
  })

  it('toggles dark mode when button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    const toggleButton = screen.getByLabelText(/toggle dark mode/i)
    const container = document.querySelector('.min-h-screen')

    // Initially light mode
    expect(container).not.toHaveClass('dark')

    // Click to enable dark mode
    await user.click(toggleButton)
    expect(container).toHaveClass('dark')

    // Click again to disable
    await user.click(toggleButton)
    expect(container).not.toHaveClass('dark')
  })

  it('renders DischargeSummaryGenerator component', () => {
    render(<App />)
    // Check for main component text
    expect(screen.getByText(/Discharge Summary Generator/i)).toBeInTheDocument()
  })
})
