const fs = require('fs');
const diff = require('diff');
const core = require('@actions/core');
const github = require('@actions/github');
const {APIDB} = require('./apidb');

const LABEL_ACR_REQUIRED = 'ACR Required';
const LABEL_INTERNAL_API_CHANGED = 'Internal API Changed';

async function run() {
  try {
    // Inputs
    const token = core.getInput('token');
    const operation = core.getInput('operation');
    const category = core.getInput('category');
    const path = core.getInput('path');

    // Read API from local file
    const rawdata = fs.readFileSync(path);
    const localItems = JSON.parse(rawdata);

    if (operation === 'compare') {
      await compareItems(token, category, localItems);
    } else if (operation == 'update') {
      await updateItems(category, localItems);
    }
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

async function compareItems(token, category, localItems) {
  const db = new APIDB();
  const dbItems = await db.query(category);

  // Compare db with local
  const comp = db.compare(dbItems, localItems);

  if (comp.totalChanged) {
    const octokit = github.getOctokit(token);

    // Create comment
    const report = makeReport(comp);
    await octokit.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      body: report,
    });

    // Create Labels
    const labels = await octokit.issues.listLabelsOnIssue({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
    });

    const labelSet = new Set(labels.data.map((i) => i.name));
    comp.publicChanged ? labelSet.add(LABEL_ACR_REQUIRED) :
                         labelSet.delete(LABEL_ACR_REQUIRED);
    comp.internalChanged ? labelSet.add(LABEL_INTERNAL_API_CHANGED) :
                           labelSet.delete(LABEL_INTERNAL_API_CHANGED);

    await octokit.issues.setLabels({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      labels: Array.from(labelSet),
    });
  }
}

async function updateItems(category, localItems) {
  const db = new APIDB();
  const dbItems = await db.query(category);

  // Compare db with local
  const comp = db.compare(dbItems, localItems);

  const addedItems = {};
  comp.addedKeys.forEach((docId) => {
    addedItems[docId] = comp.newItems[docId];
  });

  const changedItems = {};
  comp.changedKeys.forEach((docId) => {
    changedItems[docId] = comp.newItems[docId];
  });

  if (comp.totalChanged) {
    if (comp.addedKeys.size > 0) {
      console.log('## Add Items ##');
      await db.put(category, addedItems);
    }
    if (comp.changedKeys.size > 0) {
      console.log('## Update Items ##');
      await db.put(category, changedItems);
    }
    if (comp.removedKeys.size > 0) {
      console.log('## Delete Items ##');
      await db.delete(category, comp.removedKeys);
    }
  } else {
    console.log('## No items to update');
  }
}

function makeReport(comp) {
  const report = [];

  if (comp.publicChanged) {
    report.push('## Public API Changed');
    report.push('**Please follow the ACR process for the changed API below.**');
    if (comp.publicChanged > 100) {
      report.push(makeSummaryLine(
          comp.addedPublicKeys,
          comp.removedPublicKeys,
          comp.changedPublicKeys) + '\n');
    } else {
      report.push(...makeReportDetail(comp,
          comp.addedPublicKeys,
          comp.removedPublicKeys,
          comp.changedPublicKeys));
    }
  }

  if (comp.internalChanged) {
    report.push('## Internal API Changed');
    if (comp.internalChanged > 100) {
      report.push(makeSummaryLine(
          comp.addedInternalKeys,
          comp.removedInternalKeys,
          comp.changedInternalKeys) + '\n');
    } else {
      report.push(...makeReportDetail(comp,
          comp.addedInternalKeys,
          comp.removedInternalKeys,
          comp.changedInternalKeys));
    }
  }

  return report.join('\n');
}

function makeReportDetail(comp, added, removed, changed) {
  const details = [];
  details.push('<details>');
  details.push('<summary>' +
               makeSummaryLine(added, removed, changed) +
               '</summary>\n');
  if (added.size) {
    details.push('### Added');
    details.push('```diff');
    added.forEach((i) => {
      details.push(...printInfo(comp.newItems[i]).map((v) => `+ ${v}`));
      details.push('');
    });
    details.push('```');
  }
  if (removed.size) {
    details.push('### Removed');
    details.push('```diff');
    removed.forEach((i) => {
      details.push(...printInfo(comp.oldItems[i]).map((v) => `- ${v}`));
      details.push('');
    });
    details.push('```');
  }
  if (changed.size) {
    details.push('### Changed');
    details.push('```diff');
    changed.forEach((i) => {
      const oldStr = printInfo(comp.oldItems[i]).join('\n');
      const newStr = printInfo(comp.newItems[i]).join('\n');
      diff.diffLines(oldStr, newStr).forEach((p) => {
        const prefix = p.added ? '+ ' : p.removed ? '- ' : '';
        details.push(`${prefix}${p.value.trim()}`);
      });
      details.push('');
    });
    details.push('```');
  }
  details.push('</details>\n');

  return details;
}

function makeSummaryLine(add, rem, ch) {
  return `Added: ${add.size}, Removed: ${rem.size}, Changed: ${ch.size}`;
}

function printInfo(info) {
  const lines = [];
  info.Privileges && info.Privileges.forEach((v) => {
    lines.push(`/// <privilege>${v}</privilege`);
  });
  info.Features && info.Features.forEach((v) => {
    lines.push(`/// <privilege>${v}</privilege`);
  });
  info.Since && lines.push(`/// <since_tizen>${info.Since}</since_tizen`);
  info.IsObsolete && lines.push('[Obsolete]');
  info.IsHidden && lines.push('[EditorBrowsable(EditorBrowsableState.Never)]');
  lines.push(`${info.IsStatic ? 'static ' : ''}${info.Signature}`);
  return lines;
}

run();
