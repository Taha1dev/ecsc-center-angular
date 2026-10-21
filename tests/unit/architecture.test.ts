import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'vitest';
import { catalog as ecsc, demo as ecscDemo } from '../../apps/ecsc/src/config/services';
import { catalog as jus, demo as jusDemo } from '../../apps/jus/src/config/services';
import { catalog as m3, demo as m3Demo } from '../../apps/m3/src/config/services';
import { createMemoryAdapter } from '../../packages/data-access/src/data/adapter';
import { createDataClient } from '../../packages/data-access/src/data/client';
import { createFixtures } from '../../packages/data-access/src/data/fixtures';
import { createReports } from '../../packages/data-access/src/data/reports';
import { validateCenterDefinition } from '../../packages/domain/src/domain/center-definition';
import { mergeRegistry } from '../../packages/domain/src/domain/registry';
import {
  validateCatalog,
  validateValues,
  type DemoDefinition,
  type ServiceCatalog,
} from '../../packages/domain/src/domain/services';
import { validateRecord } from '../../packages/domain/src/domain/validation';
import {
  allowedTransitions,
  applyCommand,
  availability,
  standardWorkflow,
} from '../../packages/domain/src/domain/workflow';
import { checkBoundaries, checkImport } from '../../scripts/check-boundaries.mjs';
const third: ServiceCatalog = {
  groups: [{ id: 'permits', label: 'التراخيص' }],
  teams: [{ id: 'reviewers', label: 'فريق المراجعة' }],
  employees: [{ id: 'reviewer', label: 'موظف الاختبار' }],
  currentEmployeeId: 'reviewer',
  services: [
    {
      id: 'license',
      label: 'رخصة اختبار',
      groupId: 'permits',
      teamId: 'reviewers',
      ...standardWorkflow,
      fields: [
        { id: 'reference', label: 'المرجع', kind: 'text', required: true },
        { id: 'area', label: 'المساحة', kind: 'number', required: true },
        { id: 'verified', label: 'مطابق', kind: 'boolean' },
        { id: 'date', label: 'التاريخ', kind: 'date' },
        {
          id: 'category',
          label: 'الفئة',
          kind: 'select',
          options: [{ id: 'residential', label: 'سكني' }],
        },
      ],
      documents: [{ id: 'identity', label: 'الإثبات', optional: false }],
    },
  ],
};
const thirdDemo: DemoDefinition = {
  names: ['مقدم طلب اختبار'],
  identifierPrefix: '0199',
  secondParty: { id: 'TEST', label: 'جهة اختبار' },
  approvedRefundAmount: 100,
  snapshot: {
    total: 48,
    month: 48,
    year: 48,
    active: 1,
    users: 1,
    registrations: 0,
  },
  accountOffset: 0,
  services: [
    {
      id: 'license',
      representative: 'ممثل الاختبار',
      party: 'جهة الاختبار',
      decision: 'مطابقة توضيحية',
      initialPayment: 500,
      fee: 700,
      values: [
        { id: 'reference', value: { kind: 'text', value: '{id}' } },
        { id: 'area', value: { kind: 'number', value: 100 } },
        { id: 'verified', value: { kind: 'boolean', value: true } },
        { id: 'date', value: { kind: 'date', value: '2026-10-01' } },
        { id: 'category', value: { kind: 'select', value: 'residential' } },
      ],
    },
  ],
};
const time = '2026-10-08T09:00:00+03:00';
function adapter(centerId = 'third', catalog = third, demo = thirdDemo) {
  return createMemoryAdapter({
    centerId,
    catalog,
    createRecords: () => createFixtures(centerId, catalog, demo),
    snapshot: demo.snapshot,
    accounts: [],
    reports: createReports(catalog, [
      { title: 'تخصص أول', aliases: [] },
      { title: 'تخصص ثان', aliases: [] },
    ]),
    now: () => time,
  });
}
for (const [id, catalog, demo] of [
  ['ecsc', ecsc, ecscDemo],
  ['m3', m3, m3Demo],
  ['jus', jus, jusDemo],
  ['third', third, thirdDemo],
] as const) {
  test(`${id}: catalog/module registration and every deterministic fixture validates`, () => {
    validateCatalog(catalog);
    const data = adapter(id, catalog, demo);
    validateCenterDefinition({
      profile: { id },
      catalog,
      demo,
      reports: [],
      adapter: data,
    });
    const records = createFixtures(id, catalog, demo);
    assert.equal(records.length, 48);
    assert.deepEqual(records, createFixtures(id, catalog, demo));
    for (const record of records) validateRecord(record, id, catalog);
    assert.equal(records[0].serviceId, catalog.services[0].id);
    assert.equal(records[0].stageId, catalog.services[0].initialStageId);
  });
}
test('JUS mirrors ECSC demo definitions with independent center-scoped mutations', async () => {
  assert.deepEqual(jus, ecsc);
  assert.deepEqual(jusDemo, ecscDemo);
  const justice = adapter('jus', jus, jusDemo);
  const gateway = adapter('ecsc', ecsc, ecscDemo);
  const original = await gateway.getTransaction('ecsc', '1001');
  assert.ok(original);
  const justiceRecord = await justice.getTransaction('jus', '1001');
  assert.deepEqual(justiceRecord, { ...original, centerId: 'jus' });
  await justice.execute('jus', '1001', {
    type: 'note',
    text: 'متابعة مركز العدل',
  });
  assert.deepEqual(await gateway.getTransaction('ecsc', '1001'), original);
  await assert.rejects(justice.getTransaction('ecsc', '1001'));
  await assert.rejects(gateway.execute('jus', '1001', { type: 'note', text: 'مركز آخر' }));
});

test('catalog rejects duplicate IDs, dangling references and absent current employee', () => {
  assert.throws(
    () => validateCatalog({ ...third, groups: [...third.groups, ...third.groups] }),
    /Duplicate/,
  );
  assert.throws(
    () =>
      validateCatalog({
        ...third,
        services: [{ ...third.services[0], groupId: 'unknown' }],
      }),
    /references/,
  );
  assert.throws(
    () => validateCatalog({ ...third, currentEmployeeId: 'unknown' }),
    /current employee/,
  );
});
test('all five field kinds validate and reject wrong scalar/date/selection/missing values', () => {
  const service = third.services[0],
    values = thirdDemo.services[0].values;
  validateValues(service, values);
  assert.throws(() =>
    validateValues(service, [{ id: 'area', value: { kind: 'number', value: NaN } }]),
  );
  assert.throws(() =>
    validateValues(service, [
      ...values.filter((v) => v.id !== 'date'),
      { id: 'date', value: { kind: 'date', value: '2026-02-30' } },
    ]),
  );
  assert.throws(() =>
    validateValues(service, [
      ...values.filter((v) => v.id !== 'category'),
      { id: 'category', value: { kind: 'select', value: 'unknown' } },
    ]),
  );
  assert.throws(
    () =>
      validateValues(
        service,
        values.filter((v) => v.id !== 'area'),
      ),
    /يرجى إدخال/,
  );
  assert.throws(
    () =>
      validateValues(service, [
        ...values,
        { id: 'extra', value: { kind: 'text', value: 'wrong' } },
      ]),
    /الحقل غير موجود/,
  );
});
test('registry overrides replace one entry in place; additions append; conflicts reject', () => {
  const base = [
    { id: 'one', label: 'الأول' },
    { id: 'two', label: 'الثاني' },
  ];
  assert.deepEqual(
    mergeRegistry(base, {
      override: [{ id: 'two', label: 'مخصص' }],
      add: [{ id: 'three', label: 'ثالث' }],
    }).map((x) => x.label),
    ['الأول', 'مخصص', 'ثالث'],
  );
  assert.throws(() => mergeRegistry(base, { add: [base[0]] }), /Conflicting/);
  assert.throws(
    () => mergeRegistry(base, { override: [{ id: 'missing', label: '' }] }),
    /override/,
  );
  assert.throws(() => mergeRegistry(base, { override: [base[0], base[0]] }), /override/);
  assert.throws(() => mergeRegistry([...base, base[0]]), /Duplicate/);
});
test('module validation rejects foreign adapter, unknown sections, duplicate overrides and invalid routes', () => {
  const module = {
    profile: { id: 'third' },
    catalog: third,
    demo: thirdDemo,
    reports: [],
    adapter: adapter(),
  };
  assert.throws(() => validateCenterDefinition({ ...module, adapter: adapter('other') }), /match/);
  assert.throws(
    () =>
      validateCenterDefinition({
        ...module,
        catalog: {
          ...third,
          services: [{ ...third.services[0], sections: ['missing'] }],
        },
      }),
    /section/,
  );
  assert.throws(
    () =>
      validateCenterDefinition({
        ...module,
        sections: { override: [{ id: 'fields' }, { id: 'fields' }] },
      }),
    /override/,
  );
  assert.throws(
    () => validateCenterDefinition({ ...module, routes: [{ path: 'reports' }] }),
    /route/,
  );
  validateCenterDefinition({
    ...module,
    sections: { add: [{ id: 'custom' }] },
    catalog: {
      ...third,
      services: [
        {
          ...third.services[0],
          sections: [...third.services[0].sections, 'custom'],
        },
      ],
    },
  });
});
test('presentation and execution use the same eligibility; closed/owned claims reject', () => {
  const record = createFixtures('third', third, thirdDemo)[0];
  assert.equal(availability('claim', record, third).enabled, true);
  const claimed = applyCommand(record, { type: 'claim' }, third, time);
  assert.equal(record.ownerId, null);
  assert.equal(claimed.ownerId, 'reviewer');
  assert.equal(claimed.status, 'processing');
  for (const status of ['completed', 'rejected'] as const) {
    const closed = { ...record, status };
    assert.equal(availability('claim', closed, third).enabled, false);
    assert.throws(() => applyCommand(closed, { type: 'claim' }, third, time));
  }
  assert.throws(() => applyCommand(claimed, { type: 'claim' }, third, time));
  assert.throws(() =>
    applyCommand(claimed, { type: 'transfer', employeeId: 'foreign' }, third, time),
  );
  assert.equal(availability('note', record, third, { disabledActions: ['note'] }).visible, false);
  assert.throws(() =>
    applyCommand(record, { type: 'note', text: 'ملاحظة' }, third, time, {
      disabledActions: ['note'],
    }),
  );
});
test('service transitions are enforced separately from stages without payment prerequisites', () => {
  const record = {
    ...createFixtures('third', third, thirdDemo)[0],
    ownerId: 'reviewer',
  };
  assert.ok(allowedTransitions(record, third).includes('completed'));
  const completed = applyCommand(record, { type: 'status', status: 'completed' }, third, time);
  assert.equal(completed.stageId, 'delivery');
  assert.equal(completed.payments[1].paid, false);
  const restricted = {
    ...third,
    services: [
      {
        ...third.services[0],
        transitions: [{ from: 'received' as const, to: ['processing' as const] }],
      },
    ],
  };
  assert.throws(
    () => applyCommand(record, { type: 'status', status: 'completed' }, restricted, time),
    /الانتقال/,
  );
  assert.throws(() =>
    applyCommand(completed, { type: 'transfer', employeeId: 'reviewer' }, third, time),
  );
});
test('supported demo commands validate, update only their target and append an event', () => {
  const record = createFixtures('third', third, thirdDemo)[0];
  const changed = applyCommand(
    record,
    { type: 'field', fieldId: 'area', input: '245' },
    third,
    time,
  );
  assert.deepEqual(changed.serviceData.values.find((v) => v.id === 'area')?.value, {
    kind: 'number',
    value: 245,
  });
  assert.equal(record.serviceData.values.find((v) => v.id === 'area')?.value.value, 100);
  assert.throws(() =>
    applyCommand(record, { type: 'field', fieldId: 'area', input: 'text' }, third, time),
  );
  assert.throws(() =>
    applyCommand(record, { type: 'fee', feeId: 'service', amount: -10 }, third, time),
  );
  assert.throws(() =>
    applyCommand(record, { type: 'toggle-payment', paymentId: 'unknown' }, third, time),
  );
  const resolved = applyCommand(
    record,
    { type: 'resolve-note', noteId: record.notes[0].id },
    third,
    time,
  );
  assert.equal(resolved.notes[0].resolved, true);
  assert.equal(resolved.activity.length, record.activity.length + 1);
  assert.equal(resolved.activity[0].occurredAt, time);
  for (const command of [
    { type: 'completion', text: 'استكمال الإثبات' },
    { type: 'decision', text: 'مطابقة' },
    { type: 'note', text: 'متابعة' },
    { type: 'refund', amount: 100, reason: 'فرق رسم' },
    {
      type: 'document',
      document: {
        id: 'new-document',
        name: 'طلب.pdf',
        type: 'PDF',
        size: '١ ك.ب',
      },
      requirementId: 'identity',
    },
    {
      type: 'payment',
      payment: {
        id: 'new-payment',
        label: 'دفعة',
        amount: 100,
        paid: false,
        method: 'محلي',
      },
    },
    {
      type: 'applicant',
      person: {
        id: 'new-person',
        name: 'مرافق',
        identifier: '01',
        kind: 'فرد',
      },
    },
  ] satisfies import('../../packages/domain/src/domain/workflow').TransactionCommand[])
    assert.equal(applyCommand(record, command, third, time).activity.length, 3);
});
test('async adapter supports list/get/pagination/commands, rejects cross-center writes and clones reads', async () => {
  const a = adapter(),
    b = adapter('other');
  assert.equal(
    (
      await a.listTransactions({
        centerId: 'third',
        pageIndex: 1,
        pageSize: 7,
        sort: { id: 'id', descending: false },
      })
    ).rows[0].id,
    '1008',
  );
  assert.equal((await a.listTransactions({ centerId: 'third', pageSize: 7 })).total, 48);
  assert.equal(await a.getTransaction('third', 'unknown'), null);
  await assert.rejects(a.listTransactions({ centerId: 'other' }));
  await assert.rejects(a.execute('other', '1001', { type: 'claim' }));
  await assert.rejects(a.claim('third', ['1001', 'unknown']));
  assert.equal((await a.getTransaction('third', '1001'))?.ownerId, null);
  assert.deepEqual(await a.claim('third', ['1001', '1002']), {
    changed: 1,
    skipped: 1,
  });
  assert.equal((await b.getTransaction('other', '1001'))?.ownerId, null);
  const record = await a.getTransaction('third', '1001');
  assert.ok(record);
  record.people[0].name = 'Changed outside adapter';
  assert.notEqual((await a.getTransaction('third', '1001'))?.people[0].name, record.people[0].name);
  await a.transfer('third', '1001', 'reviewer');
  await a.changeStatus('third', '1001', 'waiting');
  await a.resetDemo('third');
  assert.equal((await a.getTransaction('third', '1001'))?.ownerId, null);
  await assert.rejects(a.resetDemo('other'));
});
test('two concurrent claims accept the record once; dashboard and report reads remain scoped', async () => {
  const a = adapter();
  const claims = await Promise.all([a.claim('third', ['1001']), a.claim('third', ['1001'])]);
  assert.equal(
    claims.reduce((s, c) => s + c.changed, 0),
    1,
  );
  assert.equal((await a.getDashboard('third')).records.length, 48);
  await assert.rejects(a.getDashboard('other'));
  const query = { centerId: 'third', reportId: 'report-1', values: {} };
  assert.equal((await a.getReport(query)).length, 48);
  assert.equal((await a.getReport({ ...query, reportId: 'report-6' })).length, 0);
  await assert.rejects(a.getReport({ ...query, reportId: 'report-8' }));
  assert.equal((await a.getReport({ ...query, reportId: 'report-8', retry: true })).length, 48);
  await assert.rejects(a.getReport({ ...query, centerId: 'other' }));
});
test('runtime adapter validation rejects malformed scalar data, foreign records and duplicate fixture IDs', () => {
  const record = createFixtures('third', third, thirdDemo)[0];
  assert.throws(() => validateRecord({ ...record, priority: 'unknown' }, 'third', third));
  assert.throws(() => validateRecord({ ...record, centerId: 'other' }, 'third', third));
  assert.throws(() =>
    validateRecord(
      {
        ...record,
        serviceData: {
          ...record.serviceData,
          values: [{ id: 'verified', value: { kind: 'boolean', value: 'true' } }],
        },
      },
      'third',
      third,
    ),
  );
  assert.throws(
    () =>
      createMemoryAdapter({
        centerId: 'third',
        catalog: third,
        createRecords: () => [record, record],
        snapshot: thirdDemo.snapshot,
        accounts: [],
        reports: [],
      }),
    /Duplicate/,
  );
});
test('data client exposes loading, mutation errors and retry without changing UI state', async () => {
  const base = adapter();
  let fail = true;
  const client = createDataClient(
    {
      ...base,
      listTransactions: async (query) => {
        await Promise.resolve();
        if (fail) throw new Error('Temporary read failure');
        return base.listTransactions(query);
      },
    },
    third,
  );
  const snapshots: boolean[] = [];
  const unsubscribe = client.subscribe(() => snapshots.push(client.getSnapshot().loading));
  const first = client.refresh();
  assert.equal(client.getSnapshot().loading, true);
  assert.equal(client.getSnapshot().data, null);
  await first;
  assert.equal(client.getSnapshot().error, 'تعذر تحميل بيانات المركز');
  fail = false;
  await client.refresh();
  assert.equal(client.getSnapshot().error, undefined);
  assert.equal(client.getSnapshot().data?.transactions.length, 48);
  const mutation = client.execute('1001', { type: 'claim' });
  assert.equal(client.getSnapshot().pending, true);
  await mutation;
  assert.equal(client.getSnapshot().pending, false);
  assert.equal(client.getSnapshot().data?.transactions[0].ownerId, 'reviewer');
  await assert.rejects(client.execute('1001', { type: 'claim' }));
  assert.ok(client.getSnapshot().mutationError);
  fail = true;
  await client.refresh();
  assert.equal(client.getSnapshot().data?.transactions[0].ownerId, 'reviewer');
  unsubscribe();
  assert.ok(snapshots.includes(true));
  assert.deepEqual(client.key, ['third', 'transactions']);
});
test('data clients for separate centers do not share a cache or same-number record', async () => {
  const a = createDataClient(adapter(), third),
    b = createDataClient(adapter('other'), third);
  await Promise.all([a.refresh(), b.refresh()]);
  await a.execute('1001', { type: 'claim' });
  assert.equal(a.getSnapshot().data?.transactions[0].ownerId, 'reviewer');
  assert.equal(b.getSnapshot().data?.transactions[0].ownerId, null);
  assert.notDeepEqual(a.key, b.key);
});
test('a late read cannot overwrite a newer accepted refresh', async () => {
  const base = adapter();
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let calls = 0;
  const client = createDataClient(
    {
      ...base,
      listTransactions: async (query) => {
        const call = ++calls;
        const result = await base.listTransactions(query);
        if (call === 1) await gate;
        return result;
      },
    },
    third,
  );
  const older = client.refresh();
  await base.execute('third', '1001', { type: 'claim' });
  await client.refresh();
  release();
  await older;
  assert.equal(client.getSnapshot().data?.transactions[0].ownerId, 'reviewer');
  assert.equal(client.getSnapshot().loading, false);
});
test('automated boundaries reject aliases, UI/domain dependencies and private shared paths', () => {
  const file = (s: string) => path.resolve(s);
  assert.ok(checkBoundaries() > 70);
  assert.throws(() => checkImport(file('packages/core/src/app/test.ts'), '@/app/config'));
  assert.throws(() => checkImport(file('packages/ui/src/test.ts'), '@workspace/core'));
  assert.throws(() => checkImport(file('packages/domain/src/domain/test.ts'), 'react'));
  assert.throws(() =>
    checkImport(file('packages/domain/src/domain/test.ts'), '../lib/definitions'),
  );
  assert.throws(() =>
    checkImport(file('apps/m3/src/test.ts'), '../../../packages/core/src/types/domain'),
  );
  assert.throws(() => checkImport(file('apps/m3/src/test.ts'), '@workspace/core/src/domain'));
});
