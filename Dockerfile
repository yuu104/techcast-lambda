###############
#    base     #
###############
FROM node:20

WORKDIR /usr/app


# ###############
# #    build    #
# ###############
# FROM base as builder

# COPY . .

# RUN npm install

# RUN npm run build

# ###############
# #    prod     #
# ###############
# FROM public.ecr.aws/lambda/nodejs:18 as prod

# WORKDIR ${LAMBDA_TASK_ROOT}

# COPY --from=builder /usr/app/dist/* ./

# CMD ["index.handler"]