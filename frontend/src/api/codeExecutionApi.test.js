import api from './axios';
import { runCode } from './codeExecutionApi';

jest.mock('./axios');

describe('runCode', () => {
  afterEach(() => jest.clearAllMocks());

  test('resolves immediately when the submit response is already terminal', async () => {
    api.post.mockResolvedValue({
      data: { data: { submissionId: 1, judge0Token: 't1', status: { id: 3, description: 'Accepted' }, stdout: 'ok' } },
    });

    const result = await runCode({ language: 'javascript', code: 'x', submissionId: 1, pollIntervalMs: 1 });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('ok');
    expect(api.get).not.toHaveBeenCalled();
  });

  test('polls GET /code/submissions/:id until a terminal status arrives', async () => {
    api.post.mockResolvedValue({
      data: { data: { submissionId: 1, judge0Token: 't1', status: { id: 1, description: 'In Queue' } } },
    });

    api.get
      .mockResolvedValueOnce({
        data: { data: { submissionId: 1, status: { id: 2, description: 'Processing' } } },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            submissionId: 1,
            status: { id: 3, description: 'Accepted' },
            stdout: 'done',
          },
        },
      });

    const result = await runCode({ language: 'python', code: 'x', submissionId: 1, pollIntervalMs: 1 });

    expect(api.get).toHaveBeenCalledTimes(2);
    expect(result.status.description).toBe('Accepted');
    expect(result.stdout).toBe('done');
  });

  test('rejects when the timeout is exceeded before a terminal status', async () => {
    api.post.mockResolvedValue({
      data: { data: { submissionId: 1, status: { id: 1, description: 'In Queue' } } },
    });
    api.get.mockResolvedValue({
      data: { data: { submissionId: 1, status: { id: 2, description: 'Processing' } } },
    });

    await expect(
      runCode({ language: 'python', code: 'x', submissionId: 1, pollIntervalMs: 1, timeoutMs: 2 })
    ).rejects.toThrow(/timed out/);
  });
});
