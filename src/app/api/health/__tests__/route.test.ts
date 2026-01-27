import { GET } from '../route';

describe('/api/health', () => {
  it('deve retornar status 200', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
  });
  
  it('deve retornar timestamp', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(data.timestamp).toBeDefined();
    expect(typeof data.timestamp).toBe('string');
  });
});
