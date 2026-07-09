import type * as Types from "./schema.js";
import type { GraphQLResolveInfo } from 'graphql';
import type { User, Board, Task, Comment, BoardMember, Role, TaskStatus, TaskPriority, BoardRole } from '@prisma/client';
import type { GraphQLContext } from '../graphql/context';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };


export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Types.Maybe<TTypes> | Promise<Types.Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AuthPayload: ResolverTypeWrapper<Omit<Types.AuthPayload, 'user'> & { user: ResolversTypes['User'] }>;
  Board: ResolverTypeWrapper<Board>;
  BoardMember: ResolverTypeWrapper<BoardMember>;
  BoardRole: BoardRole;
  Boolean: ResolverTypeWrapper<Types.Scalars['Boolean']['output']>;
  Comment: ResolverTypeWrapper<Comment>;
  CreateBoardInput: Types.CreateBoardInput;
  CreateTaskInput: Types.CreateTaskInput;
  ID: ResolverTypeWrapper<Types.Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Types.Scalars['Int']['output']>;
  LoginInput: Types.LoginInput;
  LogoutPayload: ResolverTypeWrapper<Types.LogoutPayload>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RefreshTokenPayload: ResolverTypeWrapper<Types.RefreshTokenPayload>;
  RegisterInput: Types.RegisterInput;
  Role: Role;
  SortOrder: Types.SortOrder;
  String: ResolverTypeWrapper<Types.Scalars['String']['output']>;
  Task: ResolverTypeWrapper<Task>;
  TaskConnection: ResolverTypeWrapper<Omit<Types.TaskConnection, 'data'> & { data: Array<ResolversTypes['Task']> }>;
  TaskFilterInput: Types.TaskFilterInput;
  TaskPriority: TaskPriority;
  TaskSortField: Types.TaskSortField;
  TaskStatus: TaskStatus;
  UpdateBoardInput: Types.UpdateBoardInput;
  UpdateTaskInput: Types.UpdateTaskInput;
  UpdateUserInput: Types.UpdateUserInput;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AuthPayload: Omit<Types.AuthPayload, 'user'> & { user: ResolversParentTypes['User'] };
  Board: Board;
  BoardMember: BoardMember;
  Boolean: Types.Scalars['Boolean']['output'];
  Comment: Comment;
  CreateBoardInput: Types.CreateBoardInput;
  CreateTaskInput: Types.CreateTaskInput;
  ID: Types.Scalars['ID']['output'];
  Int: Types.Scalars['Int']['output'];
  LoginInput: Types.LoginInput;
  LogoutPayload: Types.LogoutPayload;
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  RefreshTokenPayload: Types.RefreshTokenPayload;
  RegisterInput: Types.RegisterInput;
  String: Types.Scalars['String']['output'];
  Task: Task;
  TaskConnection: Omit<Types.TaskConnection, 'data'> & { data: Array<ResolversParentTypes['Task']> };
  TaskFilterInput: Types.TaskFilterInput;
  UpdateBoardInput: Types.UpdateBoardInput;
  UpdateTaskInput: Types.UpdateTaskInput;
  UpdateUserInput: Types.UpdateUserInput;
  User: User;
};

export type AuthPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = {
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
};

export type BoardResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Board'] = ResolversParentTypes['Board']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isArchived?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['BoardMember']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type BoardMemberResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BoardMember'] = ResolversParentTypes['BoardMember']> = {
  boardId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['BoardRole'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type BoardRoleResolvers = EnumResolverSignature<{ MEMBER?: any, OWNER?: any, VIEWER?: any }, ResolversTypes['BoardRole']>;

export type CommentResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  taskId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type LogoutPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['LogoutPayload'] = ResolversParentTypes['LogoutPayload']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addBoardMember?: Resolver<ResolversTypes['BoardMember'], ParentType, ContextType, RequireFields<Types.MutationAddBoardMemberArgs, 'boardId' | 'role' | 'userId'>>;
  addComment?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<Types.MutationAddCommentArgs, 'content' | 'taskId'>>;
  archiveBoard?: Resolver<ResolversTypes['Board'], ParentType, ContextType, RequireFields<Types.MutationArchiveBoardArgs, 'id'>>;
  archiveTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<Types.MutationArchiveTaskArgs, 'id'>>;
  assignTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<Types.MutationAssignTaskArgs, 'taskId' | 'userId'>>;
  createBoard?: Resolver<ResolversTypes['Board'], ParentType, ContextType, RequireFields<Types.MutationCreateBoardArgs, 'input'>>;
  createTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<Types.MutationCreateTaskArgs, 'input'>>;
  deleteBoard?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationDeleteBoardArgs, 'id'>>;
  deleteComment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationDeleteCommentArgs, 'id'>>;
  deleteTask?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationDeleteTaskArgs, 'id'>>;
  deleteUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationDeleteUserArgs, 'id'>>;
  login?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<Types.MutationLoginArgs, 'input'>>;
  logout?: Resolver<ResolversTypes['LogoutPayload'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['RefreshTokenPayload'], ParentType, ContextType, RequireFields<Types.MutationRefreshTokenArgs, 'token'>>;
  register?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<Types.MutationRegisterArgs, 'input'>>;
  removeBoardMember?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationRemoveBoardMemberArgs, 'boardId' | 'userId'>>;
  restoreBoard?: Resolver<ResolversTypes['Board'], ParentType, ContextType, RequireFields<Types.MutationRestoreBoardArgs, 'id'>>;
  restoreTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<Types.MutationRestoreTaskArgs, 'id'>>;
  updateBoard?: Resolver<ResolversTypes['Board'], ParentType, ContextType, RequireFields<Types.MutationUpdateBoardArgs, 'id' | 'input'>>;
  updateBoardMemberRole?: Resolver<ResolversTypes['BoardMember'], ParentType, ContextType, RequireFields<Types.MutationUpdateBoardMemberRoleArgs, 'boardId' | 'role' | 'userId'>>;
  updateComment?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<Types.MutationUpdateCommentArgs, 'content' | 'id'>>;
  updateTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<Types.MutationUpdateTaskArgs, 'id' | 'input'>>;
  updateTaskStatus?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<Types.MutationUpdateTaskStatusArgs, 'id' | 'status'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<Types.MutationUpdateUserArgs, 'id' | 'input'>>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  board?: Resolver<Types.Maybe<ResolversTypes['Board']>, ParentType, ContextType, RequireFields<Types.QueryBoardArgs, 'id'>>;
  boards?: Resolver<Array<ResolversTypes['Board']>, ParentType, ContextType>;
  me?: Resolver<Types.Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  task?: Resolver<Types.Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<Types.QueryTaskArgs, 'id'>>;
  tasks?: Resolver<ResolversTypes['TaskConnection'], ParentType, ContextType, Partial<Types.QueryTasksArgs>>;
  user?: Resolver<Types.Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<Types.QueryUserArgs, 'id'>>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
};

export type RefreshTokenPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RefreshTokenPayload'] = ResolversParentTypes['RefreshTokenPayload']> = {
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type RoleResolvers = EnumResolverSignature<{ ADMIN?: any, MANAGER?: any, USER?: any }, ResolversTypes['Role']>;

export type TaskResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Task'] = ResolversParentTypes['Task']> = {
  assignee?: Resolver<Types.Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  board?: Resolver<ResolversTypes['Board'], ParentType, ContextType>;
  comments?: Resolver<Array<ResolversTypes['Comment']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  creator?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isArchived?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['TaskPriority'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TaskStatus'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type TaskConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TaskConnection'] = ResolversParentTypes['TaskConnection']> = {
  data?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  limit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type TaskPriorityResolvers = EnumResolverSignature<{ HIGH?: any, LOW?: any, MEDIUM?: any }, ResolversTypes['TaskPriority']>;

export type TaskStatusResolvers = EnumResolverSignature<{ DONE?: any, IN_PROGRESS?: any, REVIEW?: any, TODO?: any }, ResolversTypes['TaskStatus']>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  boards?: Resolver<Array<ResolversTypes['Board']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  Board?: BoardResolvers<ContextType>;
  BoardMember?: BoardMemberResolvers<ContextType>;
  BoardRole?: BoardRoleResolvers;
  Comment?: CommentResolvers<ContextType>;
  LogoutPayload?: LogoutPayloadResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RefreshTokenPayload?: RefreshTokenPayloadResolvers<ContextType>;
  Role?: RoleResolvers;
  Task?: TaskResolvers<ContextType>;
  TaskConnection?: TaskConnectionResolvers<ContextType>;
  TaskPriority?: TaskPriorityResolvers;
  TaskStatus?: TaskStatusResolvers;
  User?: UserResolvers<ContextType>;
};

