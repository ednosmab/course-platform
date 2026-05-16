import { z } from 'zod';\nexport const TestSchema = z.string();\nconsole.log(TestSchema.parse('test'));
