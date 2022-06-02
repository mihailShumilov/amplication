import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { EnumGitProvider } from '../../../models';
import { GitCommit } from './GitCommit';
export class SendPullRequestArgs {
  @IsString()
  amplicationAppId!: string;
  @IsString()
  @IsOptional()
  oldBuildId!: string | null;
  @IsString()
  newBuildId!: string;
  @IsString()
  installationId!: string;
  @IsString()
  gitProvider!: EnumGitProvider;
  @IsString()
  gitOrganizationName!: string;
  @IsString()
  gitRepositoryName!: string;
  @ValidateNested()
  commit: GitCommit;
}