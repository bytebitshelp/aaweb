import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const TestConnection = () => {
  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    const runTests = async () => {
      console.log('Starting connection tests...')
      const results = []
      
      // Add a loading message
      setTestResults([{ test: 'Starting tests...', success: true, loading: true }])

      // Test 1: Basic connection with timeout
      try {
        console.log('Test 1: Testing basic connection...')
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout after 10 seconds')), 10000)
        )
        
        const queryPromise = supabase.from('users').select('count')
        const { data, error } = await Promise.race([queryPromise, timeoutPromise])
        
        results.push({
          test: 'Basic Connection',
          success: !error,
          error: error?.message || 'None',
          data: data
        })
      } catch (err) {
        console.error('Connection test error:', err)
        results.push({
          test: 'Basic Connection',
          success: false,
          error: err.message
        })
      }

      // Test 2: Orders table
      try {
        console.log('Test 2: Testing orders table...')
        const { data, error } = await supabase.from('orders').select('count')
        results.push({
          test: 'Orders Table',
          success: !error,
          error: error?.message || 'None',
          count: data?.[0]?.count
        })
      } catch (err) {
        results.push({
          test: 'Orders Table',
          success: false,
          error: err.message
        })
      }

      // Test 3: Artworks table
      try {
        console.log('Test 3: Testing artworks table...')
        const { data, error } = await supabase.from('artworks').select('count')
        results.push({
          test: 'Artworks Table',
          success: !error,
          error: error?.message || 'None',
          count: data?.[0]?.count
        })
      } catch (err) {
        results.push({
          test: 'Artworks Table',
          success: false,
          error: err.message
        })
      }

      // Test 4: Users table
      try {
        console.log('Test 4: Testing users table...')
        const { data, error } = await supabase.from('users').select('count')
        results.push({
          test: 'Users Table',
          success: !error,
          error: error?.message || 'None',
          count: data?.[0]?.count
        })
      } catch (err) {
        results.push({
          test: 'Users Table',
          success: false,
          error: err.message
        })
      }

      console.log('All tests completed:', results)
      setTestResults(results)
    }

    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Connection Tests</h1>
        
        <div className="space-y-4">
          {testResults.map((result, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-lg border-2 ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{result.test}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {result.success ? 'PASS' : 'FAIL'}
                </span>
              </div>
              {result.error && (
                <p className="text-sm text-red-700">Error: {result.error}</p>
              )}
              {result.count !== undefined && (
                <p className="text-sm text-gray-600">Count: {result.count}</p>
              )}
              {result.data && (
                <p className="text-sm text-gray-600">Data: {JSON.stringify(result.data)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestConnection

