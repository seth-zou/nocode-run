import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import Header from '../components/Header'

// Header uses useNavigate from react-router-dom, so it must be rendered inside
// a Router. We use MemoryRouter for rendering assertions and a standalone
// Router for navigation assertions.

describe('Header component', () => {
  it('renders the NoCode Run brand title', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )
    const title = screen.getByText('NoCode Run')
    expect(title).toBeInTheDocument()
  })

  it('navigates to the home page when the logo is clicked', async () => {
    const history = createMemoryHistory({ initialEntries: ['/app/some-app'] })
    render(
      <Router location={history.location} navigator={history}>
        <Header />
      </Router>
    )

    expect(history.location.pathname).toBe('/app/some-app')

    const logo = screen.getByText('NoCode Run')
    await userEvent.click(logo)

    expect(history.location.pathname).toBe('/')
  })
})
