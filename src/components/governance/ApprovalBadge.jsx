import React from 'react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Layers,
  Hourglass
} from 'lucide-react';
import { ApprovalStatus, ApprovalStatusLabels } from '../../services/governance/approvalTypes';
import './ApprovalBadge.css';

export default function ApprovalBadge({
  status = ApprovalStatus.PENDING,
  size = 'md', // sm, md, lg
  customLabel = null,
  showIcon = true,
  className = ''
}) {
  const getBadgeConfig = () => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return {
          icon: CheckCircle,
          label: customLabel || ApprovalStatusLabels[ApprovalStatus.APPROVED],
          cssClass: 'approval-badge-approved'
        };
      case ApprovalStatus.APPROVED_WITH_CONDITIONS:
        return {
          icon: AlertTriangle,
          label: customLabel || ApprovalStatusLabels[ApprovalStatus.APPROVED_WITH_CONDITIONS],
          cssClass: 'approval-badge-approved-with-conditions'
        };
      case ApprovalStatus.CHANGES_REQUESTED:
        return {
          icon: RotateCcw,
          label: customLabel || ApprovalStatusLabels[ApprovalStatus.CHANGES_REQUESTED],
          cssClass: 'approval-badge-changes-requested'
        };
      case ApprovalStatus.REJECTED:
        return {
          icon: XCircle,
          label: customLabel || ApprovalStatusLabels[ApprovalStatus.REJECTED],
          cssClass: 'approval-badge-rejected'
        };
      case ApprovalStatus.SUPERSEDED:
        return {
          icon: Layers,
          label: customLabel || ApprovalStatusLabels[ApprovalStatus.SUPERSEDED],
          cssClass: 'approval-badge-superseded'
        };
      case ApprovalStatus.EXPIRED:
        return {
          icon: Hourglass,
          label: customLabel || ApprovalStatusLabels[ApprovalStatus.EXPIRED],
          cssClass: 'approval-badge-expired'
        };
      case ApprovalStatus.PENDING:
      default:
        return {
          icon: Clock,
          label: customLabel || ApprovalStatusLabels[ApprovalStatus.PENDING],
          cssClass: 'approval-badge-pending'
        };
    }
  };

  const { icon: Icon, label, cssClass } = getBadgeConfig();
  const sizeClass = size === 'sm' ? 'approval-badge-sm' : size === 'lg' ? 'approval-badge-lg' : '';

  return (
    <span className={`approval-badge ${cssClass} ${sizeClass} ${className}`}>
      {showIcon && <Icon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />}
      <span>{label}</span>
    </span>
  );
}
