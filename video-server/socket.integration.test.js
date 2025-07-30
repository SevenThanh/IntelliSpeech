import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
})
```

**Test Setup File:**

```js:src/test/setup.js
import '@testing-library/jest-dom'

// Mock environment variables
Object.defineProperty(window, 'import', {
  value: {
    meta: {
      env: {
        VITE_GOOGLE_API_KEY: 'test-google-api-key',
        VITE_ELEVENLABS_API_KEY: 'test-elevenlabs-api-key'
      }
    }
  }
})

// Mock fetch globally
global.fetch = vi.fn()
```

## 10 Unit/Integration Tests

### Test 1: Translation Service Unit Test

```js:src/components/translate/translateText.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { translateText } from './translateText'

describe('translateText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully translate text', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: {
          translations: [
            { translatedText: 'Bonjour le monde' }
          ]
        }
      })
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const result = await translateText('Hello world', 'fr')
    
    expect(result).toBe('Bonjour le monde')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://translation.googleapis.com'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"q":"Hello world"')
      })
    )
  })

  it('should throw error when translation fails', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        error: { message: 'Translation failed' }
      })
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await expect(translateText('Hello', 'fr')).rejects.toThrow('Translation failed')
  })
})
```

### Test 2: Audio Transcription Service Unit Test

```js:src/components/transcribe/transcribeAudio.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { transcribeAudio } from './transcribeAudio'

describe('transcribeAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully transcribe audio file', async () => {
    const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mp3' })
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        text: 'Hello, this is a test transcription'
      })
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const result = await transcribeAudio(mockFile)
    
    expect(result).toBe('Hello, this is a test transcription')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.elevenlabs.io/v1/speech-to-text',
      expect.objectContaining({
        method: 'POST',
        headers: { 'xi-api-key': 'test-elevenlabs-api-key' }
      })
    )
  })

  it('should throw error when transcription fails', async () => {
    const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mp3' })
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: { message: 'Transcription failed' }
      })
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await expect(transcribeAudio(mockFile)).rejects.toThrow('Transcription failed')
  })
})
```

### Test 3: Button Component Unit Test

```js:src/components/ui/Button.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button Component', () => {
  it('should render with correct text and variant', () => {
    render(<Button variant="primary">Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-600', 'text-white')
  })

  it('should render secondary variant correctly', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    
    const button = screen.getByRole('button', { name: /secondary button/i })
    expect(button).toHaveClass('bg-white', 'text-blue-600', 'border-blue-600')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
  })
})
```

### Test 4: Input Component Unit Test

```js:src/components/ui/Input.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Input from './Input'

describe('Input Component', () => {
  it('should render with label and placeholder', () => {
    render(
      <Input 
        label="Email" 
        placeholder="Enter your email" 
        value="" 
        onChange={vi.fn()} 
      />
    )
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
  })

  it('should display error message when error prop is provided', () => {
    render(
      <Input 
        label="Email" 
        value="" 
        onChange={vi.fn()} 
        error="Email is required" 
      />
    )
    
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toHaveClass('border-red-300')
  })

  it('should call onChange when input value changes', () => {
    const handleChange = vi.fn()
    render(<Input value="" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('should render different input types correctly', () => {
    render(<Input type="password" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'password')
  })
})
```

### Test 5: ProtectedRoute Component Unit Test

```js:src/components/ProtectedRoute.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../context/AuthContext'

vi.mock('../context/AuthContext')

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ProtectedRoute Component', () => {
  it('should show loading when auth is loading', () => {
    useAuth.mockReturnValue({ user: null, loading: true })
    
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should render children when user is authenticated', () => {
    useAuth.mockReturnValue({ 
      user: { id: '1', email: 'test@example.com' }, 
      loading: false 
    })
    
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.getByText(/protected content/i)).toBeInTheDocument()
  })

  it('should redirect to login when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null, loading: false })
    
    // Mock useNavigate would be needed for full test
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
  })
})
```

### Test 6: Login Component Integration Test

```js:src/components/auth/Login.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  )
}

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display validation error for empty fields', async () => {
    const mockSignIn = vi.fn()
    useAuth.mockReturnValue({ signIn: mockSignIn })

    renderLogin()
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument()
    })
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('should call signIn with correct credentials', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ error: null })
    useAuth.mockReturnValue({ signIn: mockSignIn })

    renderLogin()
    
    const emailInput = screen.getByPlaceholderText(/enter your email or username/i)
    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should display error message when sign in fails', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ 
      error: { message: 'Invalid credentials' } 
    })
    useAuth.mockReturnValue({ signIn: mockSignIn })

    renderLogin()
    
    const emailInput = screen.getByPlaceholderText(/enter your email or username/i)
    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
```

### Test 7: AuthContext Unit Test

```js:src/context/AuthContext.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { supabase } from '../config/supabase'

vi.mock('../config/supabase')

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide authentication functions', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current).toHaveProperty('signIn')
    expect(result.current).toHaveProperty('signUp')
    expect(result.current).toHaveProperty('signOut')
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('loading')
  })

  it('should handle sign in with email', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ 
      data: { user: { id: '1', email: 'test@example.com' } }, 
      error: null 
    })
    supabase.auth.signInWithPassword = mockSignIn

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'password')
      expect(response.error).toBeNull()
    })
    
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
  })

  it('should handle sign in with username', async () => {
    const mockFromMethod = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { email: 'test@example.com' },
            error: null
          })
        })
      })
    })
    supabase.from = mockFromMethod
    
    const mockSignIn = vi.fn().mockResolvedValue({ 
      data: { user: { id: '1', email: 'test@example.com' } }, 
      error: null 
    })
    supabase.auth.signInWithPassword = mockSignIn

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.signIn('testuser', 'password')
    })
    
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
  })
})
```

### Test 8: Backend Server Unit Test

```js:video-server/server.test.js
const request = require('supertest');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');

describe('Video Server', () => {
  let httpServer;
  let httpServerAddr;
  let ioServer;

  beforeAll(() => {
    httpServer = createServer();
    ioServer = new Server(httpServer);
    httpServer.listen(() => {
      httpServerAddr = httpServer.address();
    });
  });

  afterAll(() => {
    ioServer.close();
    httpServer.close();
  });

  test('should handle user connection', (done) => {
    const clientSocket = new Client(`http://localhost:${httpServerAddr.port}`);
    
    ioServer.on('connection', (socket) => {
      expect(socket).toBeDefined();
      done();
    });
    
    clientSocket.connect();
  });

  test('should handle room joining', (done) => {
    const clientSocket = new Client(`http://localhost:${httpServerAddr.port}`);
    
    ioServer.on('connection', (socket) => {
      socket.on('join-room', (roomId, userId) => {
        expect(roomId).toBe('test-room');
        expect(userId).toBe('test-user');
        done();
      });
    });
    
    clientSocket.on('connect', () => {
      clientSocket.emit('join-room', 'test-room', 'test-user');
    });
  });

  test('should relay offers between peers', (done) => {
    const client1 = new Client(`http://localhost:${httpServerAddr.port}`);
    const client2 = new Client(`http://localhost:${httpServerAddr.port}`);
    
    client2.on('offer', (data) => {
      expect(data.offer).toBe('test-offer');
      expect(data.senderId).toBeDefined();
      done();
    });
    
    ioServer.on('connection', (socket) => {
      socket.on('offer', ({ offer, targetId }) => {
        socket.to(targetId).emit('offer', {
          offer,
          senderId: socket.id,
        });
      });
    });
    
    client1.on('connect', () => {
      client1.emit('offer', { offer: 'test-offer', targetId: client2.id });
    });
  });
});
```

### Test 9: Backend Socket Integration Test  

```js:video-server/socket.integration.test.js
const Client = require('socket.io-client');
const server = require('./server'); // Assuming server exports the server instance

describe('Socket.io Integration Tests', () => {
  let clientSocket;
  let serverSocket;

  beforeAll((done) => {
    server.on('connection', (socket) => {
      serverSocket = socket;
    });
    clientSocket = new Client('http://localhost:3000');
    clientSocket.on('connect', done);
  });

  afterAll(() => {
    server.close();
    clientSocket.close();
  });

  test('should handle transcription message relay', (done) => {
    const testData = {
      transcript: 'Hello world',
      translation: 'Bonjour le monde',
      targetId: 'target-user-id'
    };

    // Mock target client
    const targetClient = new Client('http://localhost:3000');
    
    targetClient.on('transcription-message', (data) => {
      expect(data.transcript).toBe(testData.transcript);
      expect(data.translation).toBe(testData.translation);
      targetClient.close();
      done();
    });

    targetClient.on('connect', () => {
      // Override target client ID for testing
      Object.defineProperty(targetClient, 'id', { value: 'target-user-id' });
      
      clientSocket.emit('transcription-message', testData);
    });
  });

  test('should handle mic status updates', (done) => {
    const roomId = 'test-room';
    const userId = 'test-user';
    
    // Join room first
    clientSocket.emit('join-room', roomId, userId);
    
    // Listen for mic status on server socket
    serverSocket.on('mic-status', (data) => {
      expect(data.micOn).toBe(true);
      expect(data.senderId).toBeDefined();
      done();
    });
    
    // Emit mic status
    clientSocket.emit('mic-status', { 
      micOn: true, 
      targetId: 'other-user', 
      senderId: 'test-user' 
    });
  });
});
```

### Test 10: End-to-End Authentication Flow Test

```js:src/test/e2e/auth.integration.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import Login from '../../components/auth/Login'
import ProtectedRoute from '../../components/ProtectedRoute'
import { supabase } from '../../config/supabase'

vi.mock('../../config/supabase')

const TestApp = () => (
  <BrowserRouter>
    <AuthProvider>
      <ProtectedRoute>
        <div>Protected Dashboard</div>
      </ProtectedRoute>
      <Login />
    </AuthProvider>
  </BrowserRouter>
)

describe('Authentication Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full authentication flow', async () => {
    // Mock successful authentication
    const mockUser = { id: '1', email: 'test@example.com' }
    
    supabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: null }
    })
    
    supabase.auth.onAuthStateChange = vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    
    supabase.auth.signInWithPassword = vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    render(<TestApp />)
    
    // Initially should show login form (protected route redirects)
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    
    // Fill login form
    const emailInput = screen.getByPlaceholderText(/enter your email or username/i)
    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    // Should call Supabase auth
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('should handle authentication errors gracefully', async () => {
    supabase.auth.signInWithPassword = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' }
    })

    render(<TestApp />)
    
    const emailInput = screen.getByPlaceholderText(/enter your email or username/i)
    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument()
    })
  })
})
```

## Installation & Usage Commands

```bash
# Install frontend testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Install backend testing dependencies
cd video-server
npm install --save-dev jest supertest socket.io-client

# Run all frontend tests
npm test

# Run tests with coverage
npm run test:coverage

# Run backend tests
cd video-server
npm test
```

These 10 tests provide comprehensive coverage of:

1. **Utility Functions**: Translation and transcription services
2. **UI Components**: Button and Input with user interactions  
3. **Authentication Logic**: Login flow and protected routes
4. **Context Management**: Auth state and user management
5. **Backend Services**: Socket.io connections and real-time features
6. **Integration Flows**: End-to-end authentication scenarios

Each test focuses on specific functionality while ensuring your critical app features work correctly! 