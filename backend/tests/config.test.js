/**
 * config.test.js
 * env.js 환경 변수 검증 및 db.js Pool 인스턴스 테스트
 */

// ─── env.js 테스트 ──────────────────────────────────────────────────────────

describe('env.js', () => {
  // 매 테스트 전 process.env 스냅샷 저장 및 Jest 모듈 레지스트리 초기화
  beforeEach(() => {
    jest.resetModules();
  });

  /**
   * 필수 기본값에 overrides를 적용하고 env.js를 fresh 로드한다.
   * overrides 값이 null이면 해당 환경 변수를 삭제한다.
   */
  function loadEnvWith(overrides = {}) {
    const base = {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'todolist_db',
      DB_USER: 'todolist_user',
      DB_PASSWORD: 'todolist1234',
      JWT_SECRET: 'your-super-secret-jwt-key-must-be-32-chars-or-more',
      JWT_EXPIRES_IN: '24h',
      PORT: '3000',
      NODE_ENV: 'test',
      CORS_ALLOWED_ORIGINS: '',
    };

    // base와 overrides의 모든 키를 먼저 삭제한 뒤 재설정
    const allKeys = new Set([...Object.keys(base), ...Object.keys(overrides)]);
    allKeys.forEach((k) => delete process.env[k]);

    const merged = { ...base, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== null) {
        process.env[k] = v;
      }
    });

    // jest.resetModules() 이후 require는 fresh 로드한다
    return require('../src/config/env');
  }

  test('필수 환경 변수가 모두 있으면 정상 export한다', () => {
    const env = loadEnvWith();

    expect(env.db.host).toBe('localhost');
    expect(env.db.port).toBe(5432);
    expect(env.db.name).toBe('todolist_db');
    expect(env.db.user).toBe('todolist_user');
    expect(env.db.password).toBe('todolist1234');
    expect(env.jwt.secret).toBe(
      'your-super-secret-jwt-key-must-be-32-chars-or-more'
    );
    expect(env.jwt.expiresIn).toBe('24h');
    expect(env.port).toBe(3000);
  });

  test('db.poolMax 기본값은 10이다', () => {
    const env = loadEnvWith({ DB_POOL_MAX: null });
    expect(env.db.poolMax).toBe(10);
  });

  test('db.connectionTimeout 기본값은 5000이다', () => {
    const env = loadEnvWith({ DB_CONNECTION_TIMEOUT: null });
    expect(env.db.connectionTimeout).toBe(5000);
  });

  test('cors.allowedOrigins를 배열로 파싱한다', () => {
    const env = loadEnvWith({
      CORS_ALLOWED_ORIGINS: 'http://localhost:5173,http://localhost:3000',
    });
    expect(env.cors.allowedOrigins).toEqual([
      'http://localhost:5173',
      'http://localhost:3000',
    ]);
  });

  test('필수 환경 변수 누락 시 process.exit(1)을 호출한다', () => {
    const mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => {
        throw new Error('process.exit called');
      });

    // JWT_SECRET을 null로 전달하여 삭제 후 env.js 로드
    expect(() => loadEnvWith({ JWT_SECRET: null })).toThrow(
      'process.exit called'
    );

    mockExit.mockRestore();
  });
});

// ─── db.js 테스트 ──────────────────────────────────────────────────────────

describe('db.js', () => {
  // db.js Pool 인스턴스를 스위트 전체에서 공유한다
  let pool;

  beforeAll(() => {
    // 실제 DB 접속 정보를 process.env에 주입한다
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'todolist_db';
    process.env.DB_USER = 'todolist_user';
    process.env.DB_PASSWORD = 'todolist1234';
    process.env.DB_POOL_MAX = '10';
    process.env.DB_IDLE_TIMEOUT = '30000';
    process.env.DB_CONNECTION_TIMEOUT = '2000';
    process.env.JWT_SECRET =
      'your-super-secret-jwt-key-must-be-32-chars-or-more';

    // env.js 테스트에서 jest.resetModules()를 호출했으므로
    // 여기서 db.js를 require하면 최신 process.env를 사용한 fresh 인스턴스가 생성된다
    jest.resetModules();
    pool = require('../src/config/db');
  });

  afterAll(async () => {
    // Pool을 한 번만 종료한다 (재사용 방지)
    await pool.end();
  });

  test('pg Pool 인스턴스가 생성된다', () => {
    expect(pool).toBeDefined();
    expect(typeof pool.query).toBe('function');
  });

  test('두 번 require해도 같은 Pool 싱글톤 인스턴스를 반환한다', () => {
    // jest.resetModules() 없이 require하면 캐시된 같은 인스턴스를 반환한다
    const pool2 = require('../src/config/db');
    expect(pool).toBe(pool2);
  });

  test('SELECT NOW() 쿼리가 성공한다', async () => {
    const result = await pool.query('SELECT NOW() AS now');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].now).toBeDefined();
    expect(result.rows[0].now).toBeInstanceOf(Date);
  });
});
